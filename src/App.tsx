import React, { useState, useMemo, useEffect, useCallback, Component } from 'react';
import { Menu, ShoppingCart, Star, ChevronRight, Clock, Flame, Trophy, TrendingUp, PlayCircle, Diamond, ArrowRightLeft, MoreHorizontal, CheckCircle, BarChart2, LogOut, ShieldCheck, AlertTriangle, Phone, Lock, UserPlus, HelpCircle, X, ChevronLeft, Copy, Zap, History, LayoutDashboard, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeMatch } from './lib/predictionEngine';
import { cn } from './lib/utils';
import { leagues, teamsByLeague } from './lib/mockData';
import { useVirtualLeague } from './lib/virtualLeague';
import { 
  auth, db, signInWithGoogle, logout, onAuthStateChanged, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  doc, getDoc, setDoc, updateDoc, collection, query, where, onSnapshot, addDoc, 
  handleFirestoreError, OperationType, User 
} from './firebase';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: string | null;
}

class ErrorBoundary extends Component<any, any> {
  state = { hasError: false, errorInfo: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1B3D] flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle size={64} className="text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Oups ! Quelque chose s'est mal passé.</h1>
          <p className="text-gray-400 mb-6 max-w-md">
            Une erreur inattendue est survenue. Veuillez rafraîchir la page ou contacter le support si le problème persiste.
          </p>
          {this.state.errorInfo && (
            <div className="bg-black/30 p-4 rounded-lg mb-6 w-full max-w-lg overflow-auto">
              <code className="text-xs text-red-400 text-left block whitespace-pre-wrap">
                {this.state.errorInfo}
              </code>
            </div>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#FFC107] text-black font-bold py-3 px-8 rounded-xl hover:bg-[#ffb300] transition-colors"
          >
            RAFRAÎCHIR LA PAGE
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

// Loading Screen Component
const LoadingScreen = ({ onFinished }: { onFinished: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onFinished, 5000);
    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <div className="min-h-screen bg-[#0B1B3D] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className="w-32 h-32 bg-[#FFC107] rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(255,193,7,0.3)] mb-8 animate-pulse">
          <Trophy size={64} className="text-black" />
        </div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-5xl font-black text-white mb-2 tracking-tighter"
        >
          PRONOSTIC <span className="text-[#FFC107]">VITAL</span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-blue-400 font-bold uppercase tracking-[0.3em] text-sm mb-12"
        >
          Le monde d'aviator
        </motion.p>

        <div className="flex flex-col items-center gap-4">
          <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 4.5, ease: "linear" }}
              className="h-full bg-[#FFC107]"
            />
          </div>
          <span className="text-gray-500 text-xs font-bold animate-pulse">PLEASE WAITING...</span>
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-0 w-full text-center">
        <p className="text-gray-600 text-[10px] font-bold tracking-widest uppercase">
          © by vital pronostic, 2026
        </p>
      </div>

      {/* 3D-like background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[20%] right-[10%] w-64 h-64 bg-[#FFC107]/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>
    </div>
  );
};

// Login Component
const Login = () => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'LOGIN') {
        // Custom logic: check in Firestore
        const userDoc = await getDoc(doc(db, 'users_custom', phone));
        if (userDoc.exists() && userDoc.data().password === password) {
          // Success - we'll use a persistent local storage for this demo
          // to avoid the Google popup if the user doesn't want it.
          // However, the app's listeners depend on 'user' from Firebase.
          // So we'll try to sign in anonymously or with a dummy email.
          try {
            // Try to sign in with a dummy email based on phone
            const email = `${phone}@vital.com`;
            try {
              await signInWithEmailAndPassword(auth, email, password);
            } catch (e) {
              // If not in Auth but in Firestore, maybe it was a legacy user or something
              // For now, we'll just use the Google fallback if email auth fails
              await signInWithGoogle();
            }
          } catch (err) {
            console.error(err);
          }
        } else {
          alert("Identifiants incorrects");
        }
      } else if (mode === 'REGISTER') {
        if (password !== confirmPassword) {
          alert("Les mots de passe ne correspondent pas");
          return;
        }
        // Create in Firestore
        await setDoc(doc(db, 'users_custom', phone), {
          phoneNumber: phone,
          password: password,
          tokens: 10, // Starter tokens
          isAdmin: false,
          createdAt: new Date().toISOString()
        });
        
        // Also try to create in Firebase Auth if possible
        try {
          const email = `${phone}@vital.com`;
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (e) {
          console.log("Auth creation skipped or failed", e);
        }

        alert("Compte créé avec succès ! Connectez-vous.");
        setMode('LOGIN');
      } else if (mode === 'FORGOT') {
        alert("Veuillez contacter l'administrateur pour réinitialiser votre mot de passe.");
        setMode('LOGIN');
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1B3D] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FFC107] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-[#FFC107] rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-[#FFC107]/20 mb-6 rotate-6">
            <Trophy size={40} className="text-black -rotate-6" />
          </div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tighter">PRONOSTIC <span className="text-[#FFC107]">VITAL</span></h1>
          <p className="text-gray-400 text-sm font-medium">Le monde d'aviator</p>
        </motion.div>

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl"
        >
          <h2 className="text-xl font-bold text-white mb-6">
            {mode === 'LOGIN' ? 'Connexion' : mode === 'REGISTER' ? 'Inscription' : 'Récupération'}
          </h2>

          <form onSubmit={handleAction} className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="tel"
                placeholder="Numéro de téléphone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FFC107] transition-colors"
              />
            </div>

            {mode !== 'FORGOT' && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FFC107] transition-colors"
                />
              </div>
            )}

            {mode === 'REGISTER' && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="password"
                  placeholder="Confirmer mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FFC107] transition-colors"
                />
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFC107] text-black font-black py-4 rounded-2xl shadow-[0_0_30px_rgba(255,193,7,0.2)] hover:bg-[#ffb300] transition-all active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? 'CHARGEMENT...' : mode === 'LOGIN' ? 'SE CONNECTER' : mode === 'REGISTER' ? "S'INSCRIRE" : 'RÉINITIALISER'}
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-3">
            {mode === 'LOGIN' ? (
              <>
                <button onClick={() => setMode('REGISTER')} className="text-gray-400 text-sm font-bold hover:text-white transition-colors flex items-center justify-center gap-2">
                  <UserPlus size={16} /> CRÉER UN COMPTE
                </button>
                <button onClick={() => setMode('FORGOT')} className="text-gray-500 text-xs font-bold hover:text-gray-300 transition-colors flex items-center justify-center gap-2">
                  <HelpCircle size={14} /> MOT DE PASSE OUBLIÉ ?
                </button>
              </>
            ) : (
              <button onClick={() => setMode('LOGIN')} className="text-gray-400 text-sm font-bold hover:text-white transition-colors">
                RETOUR À LA CONNEXION
              </button>
            )}
          </div>
        </motion.div>
        
        <div className="mt-12">
          <button 
            onClick={async () => {
              setLoading(true);
              try { await signInWithGoogle(); } catch(e) {} finally { setLoading(false); }
            }}
            className="text-white/30 text-xs font-bold hover:text-white/50 transition-colors"
          >
            OU SE CONNECTER AVEC GOOGLE
          </button>
        </div>
      </div>
    </div>
  );
};

const TeamLogo = ({ team }: { team: { name: string, logo?: string } }) => {
  if (team.logo) {
    if (team.logo.startsWith('http')) {
      return <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />;
    } else {
      return <span className="text-lg leading-none">{team.logo}</span>;
    }
  }
  const initials = team.name.substring(0, 2).toUpperCase();
  return (
    <div className="w-5 h-5 rounded-full bg-[#2A3A5B] text-white flex items-center justify-center text-[9px] font-bold shadow-sm">
      {initials}
    </div>
  );
};

const MatchRow: React.FC<{ match: any, isExpanded: boolean, onToggle: () => void }> = ({ match, isExpanded, onToggle }) => {
  const prediction = analyzeMatch(match);
  return (
    <div className="border-b border-gray-200">
      <div 
        className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="w-16 flex flex-col items-center justify-center">
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded text-center",
            match.status === 'LIVE' ? "bg-red-100 text-red-600 animate-pulse" :
            match.status === 'FT' ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"
          )}>{match.status}</span>
          {match.status === 'LIVE' && match.liveEvent && (
            <span className="text-[9px] font-bold text-red-500 mt-1 animate-bounce">
              {match.liveEvent}
            </span>
          )}
        </div>
        
        <div className="flex-1 px-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TeamLogo team={match.homeTeam} />
              <span className="text-sm font-bold text-gray-800">{match.homeTeam.name}</span>
            </div>
            {match.status !== 'NS' && <span className="font-black text-lg">{match.homeScore}</span>}
          </div>
          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center gap-2">
              <TeamLogo team={match.awayTeam} />
              <span className="text-sm font-bold text-gray-800">{match.awayTeam.name}</span>
            </div>
            {match.status !== 'NS' && <span className="font-black text-lg">{match.awayScore}</span>}
          </div>
          {match.isHotMatch && (
            <div className="mt-1">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">
                {match.hotReason}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-1 ml-2">
          <div className="flex gap-1">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-500 font-medium">1</span>
              <span className={cn("px-2 py-1 text-xs border rounded font-bold", match.status === 'NS' && prediction.matchCible.bestPrediction === '1' ? "bg-green-50 border-green-500 text-green-700" : "border-gray-200 text-gray-700 bg-white")}>
                {match.odds.home.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-500 font-medium">X</span>
              <span className={cn("px-2 py-1 text-xs border rounded font-bold", match.status === 'NS' && prediction.matchCible.bestPrediction === 'X' ? "bg-green-50 border-green-500 text-green-700" : "border-gray-200 text-gray-700 bg-white")}>
                {match.odds.draw.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-500 font-medium">2</span>
              <span className={cn("px-2 py-1 text-xs border rounded font-bold", match.status === 'NS' && prediction.matchCible.bestPrediction === '2' ? "bg-green-50 border-green-500 text-green-700" : "border-gray-200 text-gray-700 bg-white")}>
                {match.odds.away.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && match.status === 'NS' && (
        <div className="bg-gray-50 px-4 py-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Pronostic Principal */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Pronostic Principal</div>
              <div className="font-bold text-lg text-black">{prediction.matchCible.bestPrediction}</div>
              <div className="text-sm text-green-600 font-bold mt-1">Confiance: {prediction.matchCible.confidence}%</div>
            </div>
            
            {/* Score Exact */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Score Exact</div>
              <div className="font-bold text-lg text-black">{prediction.matchCible.exactScore}</div>
            </div>

            {/* Safe Bets */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Safe Bets (Free)</div>
              <div className="flex flex-wrap gap-2">
                {prediction.safeBets.over15 && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Over 1.5</span>}
                {prediction.safeBets.under45 && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Under 4.5</span>}
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">{prediction.safeBets.doubleChance}</span>
              </div>
            </div>

            {/* VIP Insights */}
            <div className="bg-[#1A1B2E] p-3 rounded-lg shadow-sm border border-[#FFC107]">
              <div className="text-xs text-[#FFC107] mb-2 font-bold uppercase tracking-wider flex items-center gap-1">
                <Star size={12} fill="currentColor" /> VIP Insights
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Alt Score:</span>
                  <span className="text-white font-bold">{prediction.vip.exactScoreAlt}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Combo:</span>
                  <span className="text-white font-bold">{prediction.vip.comboBet}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">High Odds:</span>
                  <span className="text-[#FFC107] font-bold">{prediction.vip.highOddsPrediction} (@{prediction.vip.highOddsValue})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Betting Markets */}
          {match.fullOdds && (
            <div className="space-y-4 mt-6 border-t border-gray-200 pt-4">
              <h4 className="font-bold text-[#2A3A5B] flex items-center gap-2">
                <BarChart2 size={16} /> FULL BETTING MARKETS
              </h4>
              
              {/* Over/Under */}
              <div className="bg-white rounded-lg border p-3">
                <div className="text-xs font-bold text-gray-500 mb-2 uppercase">Total Goals (Over/Under)</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(match.fullOdds.main.overUnder).map(([line, odds]: [string, any]) => (
                    <div key={line} className="flex justify-between text-sm border-b pb-1">
                      <span className="text-gray-600">O/U {line}</span>
                      <div className="flex gap-2">
                        <span className="font-bold text-green-600">{odds.over.toFixed(2)}</span>
                        <span className="font-bold text-red-600">{odds.under.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Double Chance & BTTS */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg border p-3">
                  <div className="text-xs font-bold text-gray-500 mb-2 uppercase">Double Chance</div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">1X</span>
                    <span className="font-bold">{match.fullOdds.main.doubleChance['1X'].toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">12</span>
                    <span className="font-bold">{match.fullOdds.main.doubleChance['12'].toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">X2</span>
                    <span className="font-bold">{match.fullOdds.main.doubleChance['X2'].toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg border p-3">
                  <div className="text-xs font-bold text-gray-500 mb-2 uppercase">Both Teams To Score</div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Yes</span>
                    <span className="font-bold text-green-600">{match.fullOdds.goals.btts.yes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">No</span>
                    <span className="font-bold text-red-600">{match.fullOdds.goals.btts.no.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Half Time */}
              <div className="bg-white rounded-lg border p-3">
                <div className="text-xs font-bold text-gray-500 mb-2 uppercase">Half Time (1X2)</div>
                <div className="flex justify-between text-sm">
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500 text-xs">1</span>
                    <span className="font-bold">{match.fullOdds.halfTime['1X2'].home.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500 text-xs">X</span>
                    <span className="font-bold">{match.fullOdds.halfTime['1X2'].draw.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500 text-xs">2</span>
                    <span className="font-bold">{match.fullOdds.halfTime['1X2'].away.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>Power: {prediction.powerScores.home.toFixed(1)} vs {prediction.powerScores.away.toFixed(1)}</span>
              <span>xG: {prediction.expectedGoals.home.toFixed(2)} vs {prediction.expectedGoals.away.toFixed(2)}</span>
              <span>Win %: {Math.round(prediction.winProbability.home * 100)}% / {Math.round(prediction.winProbability.draw * 100)}% / {Math.round(prediction.winProbability.away * 100)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  const [showLoading, setShowLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('All');
  const [activeNav, setActiveNav] = useState('TIPS');
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(1); // Default to today (index 1)
  
  // New States (Now managed by Firebase)
  const [tokens, setTokens] = useState(0);
  const [showAdminCodeModal, setShowAdminCodeModal] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [dailyAnalysisCount, setDailyAnalysisCount] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [estimatedGains, setEstimatedGains] = useState(0);
  const [estimatedLosses, setEstimatedLosses] = useState(0);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<'MAIN' | 'VIRTUEL' | 'AVIATOR'>('MAIN');
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [virtuelTab, setVirtuelTab] = useState('TIPS');
  const [aviatorTab, setAviatorTab] = useState('TIPS');

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // User Data Listener
  useEffect(() => {
    if (!user) {
      setUserData(null);
      setTokens(0);
      setIsAdmin(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUserData(data);
        setTokens(data.tokens || 0);
        setIsAdmin(data.isAdmin || false);
        setDailyAnalysisCount(data.dailyAnalysisCount || 0);
        setTotalProfit(data.totalProfit || 0);
        setEstimatedGains(data.estimatedGains || 0);
        setEstimatedLosses(data.estimatedLosses || 0);

        // Reset daily count if date changed
        const todayStr = new Date().toISOString().split('T')[0];
        if (data.lastAnalysisDate !== todayStr) {
          updateDoc(userRef, {
            dailyAnalysisCount: 0,
            lastAnalysisDate: todayStr
          }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`));
        }
      } else {
        // Create user profile if it doesn't exist
        const initialData = {
          uid: user.uid,
          email: user.email,
          tokens: 10, // Starter tokens
          dailyAnalysisCount: 0,
          lastAnalysisDate: new Date().toISOString().split('T')[0],
          isAdmin: false,
          totalProfit: 0,
          estimatedGains: 0,
          estimatedLosses: 0,
          createdAt: new Date().toISOString()
        };
        setDoc(userRef, initialData).catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user]);

  // Analysis History Listener
  useEffect(() => {
    if (!user) {
      setAnalysisHistory([]);
      return;
    }

    const historyQuery = query(
      collection(db, 'analysisHistory'),
      where('uid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by time descending
      history.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setAnalysisHistory(history);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'analysisHistory');
    });

    return () => unsubscribe();
  }, [user]);

  // All Users Listener (Admin only)
  useEffect(() => {
    if (!user || !isAdmin) {
      setAllUsers([]);
      return;
    }

    const usersQuery = collection(db, 'users');
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllUsers(users);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  const handleLogout = () => {
    logout();
    setActiveSection('MAIN');
    setActiveNav('TIPS');
    setIsAdmin(false);
  };

  const handleAdminAccess = () => {
    if (isAdmin) {
      setActiveNav('ADMIN');
    } else {
      setShowAdminCodeModal(true);
    }
  };

  const handleUpdateTokens = async (targetUserId: string, amount: number) => {
    try {
      const userRef = doc(db, 'users', targetUserId);
      const targetUser = allUsers.find(u => u.id === targetUserId);
      if (targetUser) {
        await updateDoc(userRef, {
          tokens: (targetUser.tokens || 0) + amount
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${targetUserId}`);
    }
  };

  const handleVirtuelAnalysis = async () => {
    if (!user || tokens <= 0) {
      alert('Veuillez activer vos tokens');
      return;
    }
    if (dailyAnalysisCount >= 10) {
      alert('Limite atteinte aujourd’hui');
      return;
    }

    setIsAnalyzingVirtuel(true);
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      const matches = virtuelMatchText.split('\n').filter(m => m.trim());
      const results = matches.map(m => ({
        match: m,
        predictions: {
          '1X2': '1',
          'HT 1X2': 'X',
          'Double Chance': '1X',
          'Score exact': '2-1',
          'Over/Under': 'Over 2.5',
          'HT/FT': '1/1',
          'GG/NG': 'GG'
        }
      }));

      const finalResults = results.length > 0 ? results : [{
        match: virtuelMatchText || "Match Analysé",
        predictions: {
          '1X2': '1',
          'HT 1X2': 'X',
          'Double Chance': '1X',
          'Score exact': '2-1',
          'Over/Under': 'Over 2.5',
          'HT/FT': '1/1',
          'GG/NG': 'GG'
        }
      }];

      setVirtuelAnalysisResult(finalResults);

      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      const newDailyCount = dailyAnalysisCount + 1;
      const profitIncrement = 15;
      const gainIncrement = 25;
      const lossIncrement = 10;

      await updateDoc(userRef, {
        tokens: tokens - 1,
        dailyAnalysisCount: newDailyCount,
        totalProfit: totalProfit + profitIncrement,
        estimatedGains: estimatedGains + gainIncrement,
        estimatedLosses: estimatedLosses + lossIncrement,
        lastAnalysisDate: new Date().toISOString().split('T')[0]
      });

      await addDoc(collection(db, 'analysisHistory'), {
        uid: user.uid,
        time: new Date().toISOString(),
        type: 'Virtuel',
        result: '2-1',
        match: virtuelMatchText
      });

      // Synchronisation Heure
      if (virtuelMatchText.includes('|')) {
        const timeStr = virtuelMatchText.split('|')[0].trim();
        if (timeStr.includes(':')) {
          const [h, m] = timeStr.split(':').map(Number);
          const newRef = new Date();
          newRef.setHours(h, m, 0, 0);
          setReferenceTime(newRef);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'analysis');
    } finally {
      setIsAnalyzingVirtuel(false);
    }
  };

  const handleAviatorAnalysis = async () => {
    if (!user || tokens <= 0) {
      alert('Veuillez activer vos tokens');
      return;
    }
    if (dailyAnalysisCount >= 10) {
      alert('Limite atteinte aujourd’hui');
      return;
    }

    setIsAnalyzingAviator(true);
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      const result = {
        rounds: ["1.85x", "2.40x", "12.50x", "1.10x", "3.20x"]
      };
      setAviatorAnalysisResult(result);

      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      const newDailyCount = dailyAnalysisCount + 1;
      
      await updateDoc(userRef, {
        tokens: tokens - 1,
        dailyAnalysisCount: newDailyCount,
        lastAnalysisDate: new Date().toISOString().split('T')[0]
      });

      await addDoc(collection(db, 'analysisHistory'), {
        uid: user.uid,
        time: new Date().toISOString(),
        type: 'Aviator',
        result: '1.85x, 2.40x...',
        match: `Last: ${aviatorLastRoundTime}`
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'analysis');
    } finally {
      setIsAnalyzingAviator(false);
    }
  };
  
  // Virtuel Foot Analysis States
  const [virtuelHistoryText, setVirtuelHistoryText] = useState('');
  const [virtuelMatchText, setVirtuelMatchText] = useState('');
  const [isAnalyzingVirtuel, setIsAnalyzingVirtuel] = useState(false);
  const [virtuelAnalysisResult, setVirtuelAnalysisResult] = useState<any>(null);
  
  // Aviator Analysis States
  const [aviatorLastRoundTime, setAviatorLastRoundTime] = useState('');
  const [aviatorRoundsText, setAviatorRoundsText] = useState('');
  const [isAnalyzingAviator, setIsAnalyzingAviator] = useState(false);
  const [aviatorAnalysisResult, setAviatorAnalysisResult] = useState<any>(null);
  
  const [referenceTime, setReferenceTime] = useState<Date | undefined>(undefined);

  const leagueStates = useVirtualLeague(referenceTime);

  const topPredictions = useMemo(() => {
    const allMatches = leagueStates.flatMap(ls => ls.slots.flatMap(s => s.matches));
    const upcomingMatches = allMatches.filter(m => m.status === 'NS' || m.status === 'LIVE');
    
    const analyzed = upcomingMatches.map(m => ({ match: m, prediction: analyzeMatch(m) }));
    analyzed.sort((a, b) => b.prediction.matchCible.confidence - a.prediction.matchCible.confidence);

    return {
      highConfidence: analyzed.filter(a => a.prediction.matchCible.confidence >= 85),
      safeOver15: analyzed.filter(a => a.prediction.safeBets.over15),
      btts: analyzed.filter(a => a.prediction.advanced.btts),
      vipOver25: analyzed.filter(a => a.prediction.advanced.over25),
      vipHighOdds: analyzed.filter(a => a.prediction.vip.highOddsValue > 2.0),
      vipExactScore: analyzed.filter(a => a.prediction.vip.exactScoreAlt),
    };
  }, [leagueStates]);

  const multipleBets = useMemo(() => {
    const betsByLeague: Record<string, any[]> = {};
    
    leagueStates.forEach(leagueState => {
      const allMatches = leagueState.slots.flatMap(s => s.matches).filter(m => m.status === 'NS');
      const analyzed = allMatches.map(m => ({ match: m, prediction: analyzeMatch(m) }));
      
      // Sort by confidence
      analyzed.sort((a, b) => b.prediction.matchCible.confidence - a.prediction.matchCible.confidence);
      
      const targetCount = leagueState.leagueName === 'Africa Cup' ? 20 : 10;
      
      // Select top matches, ensuring we mix bet types
      const selected = analyzed.slice(0, targetCount).map((item, index) => {
        // Mix bet types based on index to ensure variety
        let betType = '';
        let selection = '';
        let odds = 0;
        
        if (index % 3 === 0) {
          betType = '1X2';
          selection = item.prediction.matchCible.bestPrediction;
          odds = selection === '1' ? item.match.odds.home : selection === 'X' ? item.match.odds.draw : item.match.odds.away;
        } else if (index % 3 === 1 && item.match.fullOdds) {
          betType = 'Over/Under';
          selection = item.prediction.safeBets.over15 ? 'Over 1.5' : 'Under 4.5';
          odds = item.prediction.safeBets.over15 ? item.match.fullOdds.main.overUnder['1.5'].over : item.match.fullOdds.main.overUnder['4.5'].under;
        } else if (item.match.fullOdds) {
          betType = 'Double Chance';
          selection = item.prediction.safeBets.doubleChance;
          odds = item.match.fullOdds.main.doubleChance[selection as '1X' | '12' | 'X2'] || 1.2;
        } else {
          betType = '1X2';
          selection = item.prediction.matchCible.bestPrediction;
          odds = selection === '1' ? item.match.odds.home : selection === 'X' ? item.match.odds.draw : item.match.odds.away;
        }
        
        return {
          ...item,
          betType,
          selection,
          odds
        };
      });
      
      if (selected.length > 0) {
        betsByLeague[leagueState.leagueName] = selected;
      }
    });
    
    return betsByLeague;
  }, [leagueStates]);

  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
  
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 1 + i);
    return {
      dateObj: d,
      day: d.toLocaleString('default', { weekday: 'short' }),
      date: d.getDate(),
      isToday: i === 1,
      isYesterday: i === 0,
    };
  });

  const tabs = ['All', 'Popular', 'Favorites', 'Leagues'];
  const navItems = useMemo(() => {
    if (activeSection === 'VIRTUEL') {
      return [
        { id: 'TIPS', icon: <Flame size={20} />, label: 'TIPS' },
        { id: 'ANALYSE', icon: <BarChart2 size={20} />, label: 'ANALYSE' },
        { id: 'MULTIPLE', icon: <Trophy size={20} />, label: 'MULTIPLE' },
        { id: 'LIVE', icon: <PlayCircle size={20} />, label: 'LIVE' },
        { id: 'VIP', icon: <Diamond size={20} />, label: 'VIP' },
        { id: 'HISTORY', icon: <Clock size={20} />, label: 'STATUS' },
        { id: 'MORE', icon: <MoreHorizontal size={20} />, label: 'MORE' }
      ];
    } else if (activeSection === 'AVIATOR') {
      return [
        { id: 'TIPS', icon: <Flame size={20} />, label: 'TIPS' },
        { id: 'LIVE', icon: <PlayCircle size={20} />, label: 'LIVE' },
        { id: 'ANALYSE', icon: <BarChart2 size={20} />, label: 'ANALYSE' },
        { id: 'VIP', icon: <Diamond size={20} />, label: 'VIP' },
        { id: 'HISTORY', icon: <Clock size={20} />, label: 'HISTORY' },
        { id: 'MORE', icon: <MoreHorizontal size={20} />, label: 'MORE' }
      ];
    }
    return [];
  }, [activeSection]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (showLoading) {
    return <LoadingScreen onFinished={() => setShowLoading(false)} />;
  }

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#0B1B3D] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FFC107] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (user && activeSection === 'MAIN') {
    return (
      <div className="min-h-screen bg-[#0B1B3D] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#FFC107] rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600 rounded-full blur-[150px]"></div>
        </div>

        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10 w-full max-w-lg"
        >
          <div className="w-24 h-24 bg-[#FFC107] rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(255,193,7,0.3)] mb-8">
            <Trophy size={48} className="text-black" />
          </div>
          
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">PRONOSTIC <span className="text-[#FFC107]">VITAL</span></h1>
          <p className="text-blue-400 font-bold uppercase tracking-[0.2em] text-xs mb-12">Choisissez votre univers</p>

          <div className="grid gap-6">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSection('VIRTUEL')}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 text-left overflow-hidden transition-all hover:border-[#FFC107]/50"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC107]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#FFC107]/20 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-[#FFC107] rounded-xl flex items-center justify-center mb-4 text-black">
                  <Trophy size={24} />
                </div>
                <h3 className="text-2xl font-black text-white mb-1">VIRTUEL FOOT</h3>
                <p className="text-gray-400 text-sm">Analyses intelligentes et VIP Tips pour le football virtuel.</p>
              </div>
              <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 text-[#FFC107] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2" />
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSection('AVIATOR')}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 text-left overflow-hidden transition-all hover:border-blue-500/50"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/20 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 text-white">
                  <PlayCircle size={24} />
                </div>
                <h3 className="text-2xl font-black text-white mb-1">AVIATOR STUDIO</h3>
                <p className="text-gray-400 text-sm">Synchronisation en temps réel et prédictions avancées.</p>
              </div>
              <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 text-blue-500 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2" />
            </motion.button>
          </div>

          <button 
            onClick={handleLogout}
            className="mt-12 text-gray-500 text-xs font-bold hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <LogOut size={14} /> DÉCONNEXION
          </button>
        </motion.div>

        <div className="absolute bottom-8 left-0 w-full text-center">
          <p className="text-gray-600 text-[10px] font-bold tracking-widest uppercase">
            © by vital pronostic, 2026
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-[#1A1B2E] text-white font-sans overflow-hidden">
        {/* Side Menu Overlay */}
        <AnimatePresence>
          {showSideMenu && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSideMenu(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              />
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-[80%] max-w-xs bg-[#0B1B3D] z-[101] shadow-2xl border-r border-white/10 flex flex-col"
              >
                <div className="p-8 border-b border-white/10">
                  <div className="w-16 h-16 bg-[#FFC107] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#FFC107]/20">
                    <Trophy size={32} className="text-black" />
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tighter">PRONOSTIC <span className="text-[#FFC107]">VITAL</span></h2>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Menu Principal</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  <button 
                    onClick={() => { setActiveSection('VIRTUEL'); setShowSideMenu(false); }}
                    className={cn("w-full flex items-center gap-4 p-4 rounded-2xl transition-all", activeSection === 'VIRTUEL' ? "bg-[#FFC107] text-black" : "text-gray-400 hover:bg-white/5")}
                  >
                    <Trophy size={20} />
                    <span className="font-bold">VIRTUEL FOOT</span>
                  </button>
                  <button 
                    onClick={() => { setActiveSection('AVIATOR'); setShowSideMenu(false); }}
                    className={cn("w-full flex items-center gap-4 p-4 rounded-2xl transition-all", activeSection === 'AVIATOR' ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-white/5")}
                  >
                    <PlayCircle size={20} />
                    <span className="font-bold">AVIATOR STUDIO</span>
                  </button>
                  <div className="h-px bg-white/10 my-4 mx-4" />
                  <button 
                    onClick={() => { setActiveSection('MAIN'); setShowSideMenu(false); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-gray-400 hover:bg-white/5"
                  >
                    <LayoutDashboard size={20} />
                    <span className="font-bold">ACCUEIL</span>
                  </button>
                  <button 
                    onClick={() => { setShowSideMenu(false); alert("Contact Admin: @vital_pronostic_support"); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-gray-400 hover:bg-white/5"
                  >
                    <MessageSquare size={20} />
                    <span className="font-bold">CONTACT ADMIN</span>
                  </button>
                  <button 
                    onClick={() => { 
                      setShowSideMenu(false); 
                      if (isAdmin) {
                        setActiveNav('ADMIN');
                      } else {
                        setShowAdminCodeModal(true);
                      }
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-[#FFC107] hover:bg-[#FFC107]/10"
                  >
                    <ShieldCheck size={20} />
                    <span className="font-bold">ADMIN PANEL</span>
                  </button>
                </div>

                <div className="p-8 border-t border-white/10">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-all"
                  >
                    <LogOut size={18} /> DÉCONNEXION
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-[#1A1B2E] shrink-0 z-50">
          <button 
            onClick={() => setShowSideMenu(true)}
            className="p-2 bg-[#FFC107] rounded-md text-black"
          >
            <Menu size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black text-white tracking-tighter uppercase">
              {activeSection === 'VIRTUEL' ? 'VIRTUEL FOOT' : 'AVIATOR STUDIO'}
            </h1>
            <div className="flex items-center gap-1 bg-[#2A2B4A] px-2 py-0.5 rounded-full mt-1">
              <Diamond size={12} className="text-[#FFC107]" />
              <span className="text-[10px] font-bold text-white">{tokens} TOKENS</span>
            </div>
          </div>
          <div className="relative">
            <button className="p-2 bg-[#FFC107] rounded-md text-black">
              <ShoppingCart size={24} />
            </button>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              1
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-white text-black relative">
          {tokens <= 0 && !isAdmin && (
            <div className="absolute inset-0 z-50 bg-[#1A1B2E]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/50">
                <Lock size={40} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">ACCÈS BLOQUÉ</h2>
              <p className="text-gray-400 mb-8 max-w-xs">
                Veuillez activer vos tokens pour accéder aux analyses et pronostics VIP.
              </p>
              <button 
                onClick={() => alert("Contact Admin: @vital_pronostic_support")}
                className="bg-[#FFC107] text-black font-black py-4 px-8 rounded-2xl shadow-lg shadow-[#FFC107]/20 hover:bg-[#ffb300] transition-all active:scale-95"
              >
                ACTIVER MES TOKENS
              </button>
            </div>
          )}

      {/* Date Selector & Filter Tabs (Only for Virtuel TIPS) */}
      {activeSection === 'VIRTUEL' && activeNav === 'TIPS' && (
        <>
          <div className="bg-[#1A1B2E] pt-2 pb-1">
            <div className="text-center text-gray-400 text-sm font-semibold mb-2 tracking-widest">
              {currentMonth}
            </div>
            <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar pb-2">
              {dates.map((d, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedDateIndex(i);
                    if (i === 0) setActiveNav('RESULTS');
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[60px] py-2 rounded-lg text-sm transition-all",
                    selectedDateIndex === i ? "bg-[#FFC107] text-black shadow-md shadow-[#FFC107]/20" : "bg-[#2A2B4A] text-gray-400 hover:bg-[#2A2B4A]/80",
                    d.isToday && selectedDateIndex !== i && "border border-[#FFC107]/50"
                  )}
                >
                  <span className="font-medium text-xs uppercase">{d.day}</span>
                  <span className={cn("text-lg font-bold", selectedDateIndex === i ? "text-black" : "text-white")}>{d.date}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 px-4 py-3 bg-[#1A1B2E]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-1.5 rounded-full text-sm font-medium border",
                  activeTab === tab
                    ? "bg-[#FFC107] text-black border-[#FFC107]"
                    : "bg-transparent text-gray-300 border-gray-600"
                )}
              >
                {tab}
              </button>
            ))}
            <button className="p-1.5 rounded-full border border-gray-600 text-gray-300">
              <Menu size={20} />
            </button>
          </div>
        </>
      )}

      {/* Match List */}
      <div className="flex-1 overflow-y-auto bg-white text-black">
        {(() => {
          // Global Admin Panel (if selected from side menu or bottom nav)
          if (activeNav === 'ADMIN') {
            return (
              <div className="p-4 bg-gray-50 min-h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-[#1A1B2E] flex items-center gap-2">
                    <ShieldCheck className="text-[#FFC107]" /> ADMIN PANEL
                  </h2>
                  <button 
                    onClick={handleLogout}
                    className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100"
                  >
                    DÉCONNEXION
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                  <div className="bg-[#2A3A5B] text-white px-4 py-3">
                    <h3 className="font-bold">Liste des Utilisateurs ({allUsers.length})</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {allUsers.map((u) => (
                      <div key={u.id} className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800">ID: {u.id.substring(0, 8)}...</span>
                          <span className="text-xs text-gray-500">{u.email}</span>
                          {u.phoneNumber && <span className="text-[10px] text-gray-400">{u.phoneNumber}</span>}
                          <div className="flex gap-2 mt-1">
                            {u.expirationDate && <span className="text-[9px] bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">Exp: {u.expirationDate}</span>}
                            {u.status && <span className={cn("text-[9px] px-1 rounded border", u.status === 'ACTIF' ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100")}>{u.status}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-black text-[#1A1B2E]">{u.tokens || 0} Tokens</div>
                            <div className={cn("text-[10px] font-bold uppercase", u.isAdmin ? "text-purple-600" : "text-green-600")}>
                              {u.isAdmin ? "Admin" : "Client"}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleUpdateTokens(u.id, 10)}
                                className="bg-[#FFC107] text-black text-[10px] font-bold px-2 py-1 rounded shadow-sm active:scale-95"
                              >
                                +10 TK
                              </button>
                              <button 
                                onClick={() => handleUpdateTokens(u.id, 50)}
                                className="bg-[#FFC107] text-black text-[10px] font-bold px-2 py-1 rounded shadow-sm active:scale-95"
                              >
                                +50 TK
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  const userRef = doc(db, 'users', u.id);
                                  updateDoc(userRef, { 
                                    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                    status: 'ACTIF'
                                  });
                                }}
                                className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm active:scale-95"
                              >
                                DURÉE (30J)
                              </button>
                              <button 
                                onClick={() => {
                                  const userRef = doc(db, 'users', u.id);
                                  updateDoc(userRef, { status: 'ACTIF' });
                                }}
                                className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm active:scale-95"
                              >
                                ACTIVER
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {allUsers.length === 0 && (
                      <div className="p-8 text-center text-gray-400 text-sm italic">
                        Aucun utilisateur trouvé ou accès restreint.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          if (activeSection === 'VIRTUEL') {
            if (activeNav === 'ANALYSE') {
              return (
                <div className="p-4 bg-gray-50 min-h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-[#1A1B2E] flex items-center gap-2">
                      <BarChart2 className="text-[#FFC107]" /> VIRTUEL ANALYSE
                    </h2>
                    <div className="bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm flex items-center gap-2">
                      <TrendingUp size={14} className="text-green-500" />
                      <span className="text-xs font-bold text-gray-700">Profit: {totalProfit}€</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* ÉTAPE 1: COLLER HISTORIQUE */}
                    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-[#2A3A5B] text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <h3 className="font-bold text-[#2A3A5B]">COLLER HISTORIQUE</h3>
                      </div>
                      <textarea 
                        value={virtuelHistoryText}
                        onChange={(e) => setVirtuelHistoryText(e.target.value)}
                        placeholder="Collez ici l'historique des derniers matchs..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2A3A5B] min-h-[100px]"
                      />
                    </div>

                    {/* ÉTAPE 2: MATCH À ANALYSER */}
                    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-[#2A3A5B] text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                        <h3 className="font-bold text-[#2A3A5B]">MATCH À ANALYSER</h3>
                      </div>
                      <input 
                        type="text"
                        value={virtuelMatchText}
                        onChange={(e) => setVirtuelMatchText(e.target.value)}
                        placeholder="Ex: 12:30 | Arsenal vs Chelsea"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2A3A5B]"
                      />
                    </div>

                    {/* ÉTAPE 3: ANALYSE */}
                    <button 
                      disabled={isAnalyzingVirtuel || tokens <= 0 || dailyAnalysisCount >= 10}
                      onClick={handleVirtuelAnalysis}
                      className={cn(
                        "w-full mt-3 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2",
                        tokens <= 0 || dailyAnalysisCount >= 10 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#FFC107] text-black hover:bg-[#ffb300]"
                      )}
                    >
                      {isAnalyzingVirtuel ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          ANALYSE EN COURS...
                        </>
                      ) : (
                        <>
                          <BarChart2 size={18} />
                          ANALYSE (-1 TOKEN)
                        </>
                      )}
                    </button>
                    {dailyAnalysisCount >= 10 && (
                      <p className="text-center text-red-500 text-[10px] font-bold mt-2 uppercase">Limite atteinte aujourd’hui</p>
                    )}

                    {/* RÉSULTAT ANALYSE */}
                    {virtuelAnalysisResult && (
                      <div className="bg-[#1A1B2E] rounded-xl p-5 shadow-xl border border-[#FFC107]/30 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2 text-[#FFC107] font-black mb-4 uppercase tracking-widest text-sm border-b border-[#FFC107]/10 pb-3">
                          <Trophy size={18} fill="currentColor" /> RÉSULTAT ANALYSE
                        </div>
                        <div className="space-y-4">
                          {virtuelAnalysisResult.map((res: any, i: number) => (
                            <div key={i} className="space-y-3">
                              <div className="text-white font-bold text-center bg-white/5 py-2 rounded border border-white/10">
                                {res.match}
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(res.predictions).map(([key, val]: [string, any]) => (
                                  <div key={key} className="flex justify-between items-center text-xs bg-black/20 p-2 rounded border border-gray-800">
                                    <span className="text-gray-400 font-medium">{key}</span>
                                    <span className="text-[#FFC107] font-black">{val}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            if (activeNav === 'HISTORY') {
              return (
                <div className="p-4 bg-gray-50 min-h-full">
                  <h2 className="text-xl font-black text-[#1A1B2E] mb-6 flex items-center gap-2">
                    <Clock className="text-[#FFC107]" /> STATUS & HISTORIQUE
                  </h2>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Gains Estimés</span>
                      <div className="text-xl font-black text-green-600">+{estimatedGains}€</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Pertes Estimées</span>
                      <div className="text-xl font-black text-red-600">-{estimatedLosses}€</div>
                    </div>
                    <div className="bg-[#1A1B2E] p-4 rounded-xl shadow-md border border-gray-800 col-span-2 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Total Profit</span>
                        <div className="text-2xl font-black text-[#FFC107]">{totalProfit}€</div>
                      </div>
                      <TrendingUp size={32} className="text-[#FFC107] opacity-20" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                    <h3 className="font-bold text-[#2A3A5B] mb-4">Dernières Analyses</h3>
                    <div className="space-y-3">
                      {analysisHistory.length > 0 ? analysisHistory.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-800">{item.type} Analysis</span>
                            <span className="text-[10px] text-gray-500">{item.time}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-[#2A3A5B] block">{item.result}</span>
                            <span className="text-[9px] text-green-600 font-bold">SUCCESS</span>
                          </div>
                        </div>
                      )) : (
                        <p className="text-center text-gray-400 text-xs py-4">Aucun historique disponible</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
            
            // Default to TIPS or other tabs
            // (TIPS logic will be handled later in the switch)
          }

          if (activeSection === 'AVIATOR') {
            if (activeNav === 'ANALYSE') {
              return (
                <div className="p-4 bg-gray-50 min-h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-[#1A1B2E] flex items-center gap-2">
                      <PlayCircle className="text-red-500" /> AVIATOR ANALYSE
                    </h2>
                    <div className="bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm flex items-center gap-2">
                      <TrendingUp size={14} className="text-green-500" />
                      <span className="text-xs font-bold text-gray-700">Profit: {totalProfit}€</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* ÉTAPE 1: HEURE */}
                    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-[#2A3A5B] text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <h3 className="font-bold text-[#2A3A5B]">HEURE DERNIER TOUR</h3>
                      </div>
                      <input 
                        type="text"
                        value={aviatorLastRoundTime}
                        onChange={(e) => setAviatorLastRoundTime(e.target.value)}
                        placeholder="Ex: 12:30"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2A3A5B]"
                      />
                    </div>

                    {/* ÉTAPE 2: TOURS */}
                    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-[#2A3A5B] text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                        <h3 className="font-bold text-[#2A3A5B]">TEXTE TOURS</h3>
                      </div>
                      <textarea 
                        value={aviatorRoundsText}
                        onChange={(e) => setAviatorRoundsText(e.target.value)}
                        placeholder="Ex: 2.13, 2.45, 5.56, 3.56, 12.01"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2A3A5B] min-h-[80px]"
                      />
                    </div>

                    {/* ÉTAPE 3: ANALYSE */}
                    <button 
                      disabled={isAnalyzingAviator || tokens <= 0 || dailyAnalysisCount >= 10}
                      onClick={handleAviatorAnalysis}
                      className={cn(
                        "w-full mt-3 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2",
                        tokens <= 0 || dailyAnalysisCount >= 10 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#FFC107] text-black hover:bg-[#ffb300]"
                      )}
                    >
                      {isAnalyzingAviator ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          ANALYSE EN COURS...
                        </>
                      ) : (
                        <>
                          <BarChart2 size={18} />
                          ANALYSE (-1 TOKEN)
                        </>
                      )}
                    </button>
                    {dailyAnalysisCount >= 10 && (
                      <p className="text-center text-red-500 text-[10px] font-bold mt-2 uppercase">Limite atteinte aujourd’hui</p>
                    )}

                    {/* RÉSULTAT AVIATOR */}
                    {aviatorAnalysisResult && (
                      <div className="bg-[#1A1B2E] rounded-xl p-5 shadow-xl border border-red-500/30 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2 text-red-500 font-black mb-4 uppercase tracking-widest text-sm border-b border-red-500/10 pb-3">
                          <PlayCircle size={18} fill="currentColor" /> TOURS FUTURS FIXES
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {aviatorAnalysisResult.rounds.map((round: string, i: number) => (
                            <div key={i} className="flex justify-between items-center text-sm bg-black/20 p-3 rounded border border-gray-800">
                              <span className="text-gray-400 font-medium">Tour {i+1}</span>
                              <span className={cn(
                                "font-black text-lg",
                                parseFloat(round) > 10 ? "text-pink-500" : parseFloat(round) > 2 ? "text-purple-500" : "text-blue-500"
                              )}>{round}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            if (activeNav === 'HISTORY') {
              return (
                <div className="p-4 bg-gray-50 min-h-full">
                  <h2 className="text-xl font-black text-[#1A1B2E] mb-6 flex items-center gap-2">
                    <Clock className="text-red-500" /> AVIATOR HISTORY
                  </h2>
                  <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                    <h3 className="font-bold text-[#2A3A5B] mb-4">Dernières Analyses Aviator</h3>
                    <div className="space-y-3">
                      {analysisHistory.filter(h => h.type === 'Aviator').length > 0 ? analysisHistory.filter(h => h.type === 'Aviator').map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500">{item.time}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-[#2A3A5B] block">{item.result}</span>
                            <span className="text-[9px] text-green-600 font-bold">SUCCESS</span>
                          </div>
                        </div>
                      )) : (
                        <p className="text-center text-gray-400 text-xs py-4">Aucun historique disponible</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          }
          if (activeNav === 'RESULTS') {
            return (
              <div className="p-4">
                <h2 className="text-xl font-bold text-[#1A1B2E] mb-4 flex items-center gap-2">
                  <CheckCircle className="text-green-500" /> RESULTS - {dates[0].day} {dates[0].date}
                </h2>
                {leagueStates.map(league => (
                  <div key={league.leagueId} className="mb-6">
                    <div className="flex items-center gap-2 mb-3 bg-gray-100 p-2 rounded-lg border-l-4 border-[#2A3A5B]">
                      {league.leagueLogo && <img src={league.leagueLogo} alt={league.leagueName} className="w-6 h-6 object-contain" />}
                      <h3 className="font-bold text-[#2A3A5B]">{league.leagueName}</h3>
                    </div>
                    <div className="space-y-2">
                      {/* Mock results based on the league's teams */}
                      {(() => {
                        const teams = teamsByLeague[league.leagueId] || [];
                        const results = [];
                        for(let i=0; i<Math.min(4, Math.floor(teams.length/2)); i++) {
                          const home = teams[i*2];
                          const away = teams[i*2+1];
                          // Generate deterministic mock scores based on team names
                          const homeScore = (home.name.length * 7) % 4;
                          const awayScore = (away.name.length * 3) % 4;
                          results.push(
                            <div key={i} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                              <div className="flex items-center gap-2 flex-1 justify-end">
                                <span className="font-medium text-sm text-gray-800">{home.name}</span>
                                <TeamLogo team={home} />
                              </div>
                              <div className="px-4 font-bold text-lg bg-gray-100 rounded mx-2 min-w-[60px] text-center">
                                {homeScore} - {awayScore}
                              </div>
                              <div className="flex items-center gap-2 flex-1 justify-start">
                                <TeamLogo team={away} />
                                <span className="font-medium text-sm text-gray-800">{away.name}</span>
                              </div>
                            </div>
                          );
                        }
                        return results;
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          if (activeNav === 'STATS') {
            return (
              <div className="p-4">
                <h2 className="text-xl font-bold text-[#1A1B2E] mb-4 flex items-center gap-2">
                  <BarChart2 className="text-blue-500" /> LEAGUE STATS
                </h2>
                {leagues.map(league => (
                  <div key={league.id} className="mb-6">
                    <div className="flex items-center gap-2 mb-3 bg-gray-100 p-2 rounded-lg border-l-4 border-[#2A3A5B]">
                      {league.logo && <img src={league.logo} alt={league.name} className="w-6 h-6 object-contain" />}
                      <h3 className="font-bold text-[#2A3A5B]">{league.name}</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th className="px-4 py-2">Team</th>
                            <th className="px-4 py-2 text-center">Form</th>
                            <th className="px-4 py-2 text-center">GF</th>
                            <th className="px-4 py-2 text-center">GA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(teamsByLeague[league.id] || []).map((team, i) => (
                            <tr key={i} className="bg-white border-b">
                              <td className="px-4 py-2 font-medium text-gray-900 flex items-center gap-2">
                                <TeamLogo team={team} />
                                {team.name}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {team.last5Matches.map((res, j) => (
                                    <span key={j} className={cn(
                                      "w-4 h-4 rounded text-[10px] flex items-center justify-center text-white font-bold",
                                      res === 'W' ? "bg-green-500" : res === 'D' ? "bg-gray-400" : "bg-red-500"
                                    )}>
                                      {res}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-center">{team.goalsScored}</td>
                              <td className="px-4 py-2 text-center">{team.goalsConceded}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          if (activeNav === 'MULTIPLE') {
            return (
              <div className="p-4 bg-gray-50 min-h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-[#1A1B2E] flex items-center gap-2">
                    <Trophy className="text-[#FFC107]" /> MULTIPLE BETS
                  </h2>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
                    High Probability
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-6 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  These selections are algorithmically generated to balance risk and reward, prioritizing high-confidence predictions across different markets.
                </p>

                {Object.entries(multipleBets as Record<string, any[]>).map(([leagueName, bets]) => {
                  const totalOdds = bets.reduce((acc: number, bet: any) => acc * bet.odds, 1);
                  
                  return (
                    <div key={leagueName} className="mb-8 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                      <div className="bg-[#2A3A5B] text-white px-4 py-3 flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2">
                          <span className="text-xl">{leagueStates.find(l => l.leagueName === leagueName)?.leagueLogo || '🏆'}</span>
                          {leagueName}
                        </h3>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-blue-200 uppercase tracking-wider font-bold">Total Odds</span>
                          <span className="text-[#FFC107] font-black text-lg">@{totalOdds.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="divide-y divide-gray-100">
                        {bets.map((bet, idx) => (
                          <div key={idx} className="p-3 hover:bg-gray-50 transition-colors flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}.</span>
                                <span className="text-sm font-bold text-gray-800">{bet.match.homeTeam.name} vs {bet.match.awayTeam.name}</span>
                              </div>
                              <div className="flex items-center gap-2 pl-6">
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{bet.betType}</span>
                                <span className="text-xs font-bold text-[#2A3A5B]">{bet.selection}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end pl-4 border-l border-gray-100">
                              <span className="text-xs text-green-600 font-bold mb-1">{bet.prediction.matchCible.confidence}% Conf.</span>
                              <span className="font-black text-lg text-[#1A1B2E]">@{bet.odds.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          <span className="font-bold text-gray-900">{bets.length}</span> Selections
                        </div>
                        <button className="bg-[#FFC107] hover:bg-[#ffb300] text-black font-bold py-2 px-6 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                          <ShoppingCart size={16} /> ADD TO SLIP
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {Object.keys(multipleBets).length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No matches available for multiple bets right now.</p>
                    <p className="text-sm mt-2">Please wait for the next cycle.</p>
                  </div>
                )}
              </div>
            );
          }

          const firstLeague = leagueStates[0];
          const displayedSlots = activeNav === 'LIVE'
            ? firstLeague.slots.filter(s => firstLeague.currentSlotTime && s.time.getTime() === firstLeague.currentSlotTime.getTime())
            : activeNav === 'VIP'
            ? firstLeague.slots.filter(s => s.status === 'OPEN').slice(0, 1)
            : activeNav === 'RESULTS'
            ? firstLeague.slots.filter(s => s.status === 'FINISHED')
            : firstLeague.slots.filter(s => firstLeague.currentSlotTime ? s.time.getTime() >= firstLeague.currentSlotTime.getTime() : s.status === 'OPEN');

          if (firstLeague.isBreak) {
            return (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="text-6xl mb-4">☕</div>
                <h2 className="text-2xl font-bold text-[#2A3A5B] mb-2">MI-TEMPS / PAUSE</h2>
                <p className="text-gray-600 mb-4">Les prochaines rencontres commencent dans :</p>
                <div className="text-4xl font-black text-[#FFC107] bg-[#1A1B2E] px-6 py-3 rounded-xl shadow-lg">
                  {Math.ceil(firstLeague.breakTimeRemaining / 60000)} min
                </div>
              </div>
            );
          }

          if (activeNav === 'TIPS') {
            let filteredLeagueStates = leagueStates;
            if (activeTab === 'Popular') {
              filteredLeagueStates = leagueStates.filter(l => ['eng', 'ucl', 'spa'].includes(l.leagueId));
            } else if (activeTab === 'Favorites') {
              filteredLeagueStates = leagueStates.filter(l => ['eng', 'afr'].includes(l.leagueId));
            }

            return filteredLeagueStates.map((leagueState) => (
              <div key={leagueState.leagueId} className="mb-6">
                <div className="bg-[#2A3A5B] text-blue-100 px-4 py-2 font-bold text-lg sticky top-0 z-20 flex items-center gap-2 shadow-md">
                  <span>{leagueState.leagueLogo || '🏆'}</span> {leagueState.leagueName}
                </div>
                {leagueState.slots.filter(s => leagueState.currentSlotTime ? s.time.getTime() >= leagueState.currentSlotTime.getTime() : s.status === 'OPEN').map(slot => {
                  if (slot.matches.length === 0) return null;
                  return (
                    <div key={slot.time.toISOString()} className="mb-4">
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 text-gray-800 sticky top-10 z-10 border-y border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-500" />
                          <span className="font-bold tracking-wider">{formatTime(slot.time)}</span>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider",
                          slot.status === 'OPEN' ? "bg-green-100 text-green-700" :
                          slot.status === 'PLAYING' ? "bg-yellow-100 text-yellow-800 animate-pulse" :
                          "bg-gray-200 text-gray-600"
                        )}>
                          {slot.status}
                        </span>
                      </div>
                      {slot.matches.map(match => (
                        <MatchRow 
                          key={match.id} 
                          match={match} 
                          isExpanded={selectedMatch === match.id} 
                          onToggle={() => setSelectedMatch(selectedMatch === match.id ? null : match.id)} 
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            ));
          }

          return displayedSlots.map((slot) => {
            // Filter leagues based on activeTab
            let filteredLeagueStates = leagueStates;
            if (activeTab === 'Popular') {
              filteredLeagueStates = leagueStates.filter(l => ['eng', 'ucl', 'spa'].includes(l.leagueId)); // Example popular leagues
            } else if (activeTab === 'Favorites') {
              filteredLeagueStates = leagueStates.filter(l => ['eng', 'afr'].includes(l.leagueId)); // Example favorites
            } else if (activeTab === 'Leagues') {
              // Just show all for now, could open a modal
              filteredLeagueStates = leagueStates;
            }

            return (
            <div key={slot.time.toISOString()} className="mb-6">
              {slot.isNewCycle && (
                <div className="px-4 py-2 bg-blue-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md">
                  <span className="text-xl">🆕</span> NOUVEAU CYCLE
                </div>
              )}
              
              <div className="flex items-center justify-between px-4 py-3 bg-[#3A4A6B] text-white sticky top-0 z-20 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-[#FFC107]" />
                    <span className="font-black text-xl tracking-wider">{formatTime(slot.time)}</span>
                  </div>
                  <span className={cn(
                    "px-3 py-1 text-xs font-bold rounded uppercase tracking-wider shadow-sm",
                    slot.status === 'OPEN' ? "bg-green-500 text-white" :
                    slot.status === 'PLAYING' ? "bg-yellow-500 text-black animate-pulse" :
                    "bg-gray-500 text-white"
                  )}>
                    {slot.status}
                  </span>
                </div>
                {firstLeague.currentSlotTime && slot.time.getTime() === firstLeague.currentSlotTime.getTime() && (
                  <div className="text-sm font-bold text-[#FFC107] flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
                    {slot.status === 'PLAYING' ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                        {Math.floor((firstLeague.timeInSlot - 40000) / 1000 * 1.5)}'
                      </>
                    ) : slot.status === 'OPEN' ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                        {Math.max(0, Math.floor((40000 - firstLeague.timeInSlot) / 1000))}s
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#FFC107] animate-ping"></span>
                        {Math.max(0, Math.floor((120000 - firstLeague.timeInSlot) / 1000))}s
                      </>
                    )}
                  </div>
                )}
              </div>

              {filteredLeagueStates.map(leagueState => {
                const leagueSlot = leagueState.slots.find(s => s.time.getTime() === slot.time.getTime());
                if (!leagueSlot || leagueSlot.matches.length === 0) return null;

                if (activeNav === 'VIP') {
                  return (
                    <div key={`vip-${leagueState.leagueId}-${slot.time.toISOString()}`} className="mb-6 mx-4 mt-4 bg-[#1A1B2E] rounded-xl overflow-hidden shadow-xl border border-gray-800">
                      <div className="bg-gradient-to-r from-[#2A3A5B] to-[#1A1B2E] px-4 py-3 flex items-center justify-between border-b border-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{leagueState.leagueLogo || '🏆'}</span>
                          <span className="font-bold text-white">{leagueState.leagueName}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded text-[#FFC107] font-bold text-sm">
                          ⏱️ {formatTime(slot.time)}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-[#131420]">
                        <div className="space-y-2 mb-5">
                          {leagueSlot.matches.map((match) => (
                            <div key={`vip-match-${match.id}`} className="flex items-center justify-between text-sm font-medium text-white bg-[#1A1B2E] p-3 rounded-lg border border-gray-800 shadow-sm">
                              <div className="flex items-center gap-3 flex-1 justify-end">
                                <span className="font-semibold tracking-wide">{match.homeTeam.name}</span>
                                <TeamLogo team={match.homeTeam} />
                              </div>
                              <div className="px-4 text-[#FFC107] font-black flex flex-col items-center justify-center min-w-[60px]">
                                {match.status !== 'NS' ? (
                                  <>
                                    <span className="text-xl leading-none tracking-wider">{match.homeScore} - {match.awayScore}</span>
                                    <span className={cn(
                                      "text-[9px] mt-1 px-1.5 py-0.5 rounded uppercase tracking-wider",
                                      match.status === 'LIVE' ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-gray-500/20 text-gray-400"
                                    )}>{match.status}</span>
                                  </>
                                ) : (
                                  <span className="text-gray-500 text-xs">VS</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 flex-1 justify-start">
                                <TeamLogo team={match.awayTeam} />
                                <span className="font-semibold tracking-wide">{match.awayTeam.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="bg-gradient-to-br from-[#1A1B2E] to-[#0B1B3D] rounded-xl p-5 border border-[#FFC107]/20 shadow-lg relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC107]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                          
                          <div className="flex items-center gap-2 text-[#FFC107] font-black mb-4 uppercase tracking-widest text-sm border-b border-[#FFC107]/10 pb-3">
                            <Diamond size={18} fill="currentColor" className="drop-shadow-[0_0_8px_rgba(255,193,7,0.5)]" /> VIP PICKS
                          </div>
                          
                          {(() => {
                            const bestMatch = [...leagueSlot.matches].sort((a, b) => {
                              const pA = analyzeMatch(a);
                              const pB = analyzeMatch(b);
                              return pB.matchCible.confidence - pA.matchCible.confidence;
                            })[0];
                            const prediction = analyzeMatch(bestMatch);
                            
                            return (
                              <div className="space-y-3 relative z-10">
                                <div className="flex justify-between items-center text-sm bg-black/20 p-2 rounded">
                                  <span className="text-gray-400 font-medium">Best Match</span>
                                  <span className="text-white font-bold tracking-wide">{bestMatch.homeTeam.name} vs {bestMatch.awayTeam.name}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm bg-black/20 p-2 rounded">
                                  <span className="text-gray-400 font-medium">Prediction</span>
                                  <span className="text-[#FFC107] font-black text-base drop-shadow-md">{prediction.matchCible.bestPrediction} <span className="text-xs text-[#FFC107]/80 font-bold">({prediction.matchCible.confidence}%)</span></span>
                                </div>
                                <div className="flex justify-between items-center text-sm bg-black/20 p-2 rounded">
                                  <span className="text-gray-400 font-medium">Over/Under</span>
                                  <span className="text-white font-bold">{prediction.safeBets.over15 ? 'Over 1.5' : 'Under 4.5'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm bg-black/20 p-2 rounded">
                                  <span className="text-gray-400 font-medium">BTTS</span>
                                  <span className="text-white font-bold">{prediction.advanced.btts ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm bg-black/20 p-2 rounded">
                                  <span className="text-gray-400 font-medium">Exact Score</span>
                                  <span className="text-[#00E676] font-black tracking-wider">{prediction.vip.exactScoreAlt}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={`${leagueState.leagueId}-${slot.time.toISOString()}`} className="mb-4">
                    <div className="bg-[#2A3A5B] text-blue-100 px-4 py-1.5 font-bold text-sm sticky top-14 z-10 flex items-center gap-2 border-b border-[#1A1B2E]/20">
                      <span>{leagueState.leagueLogo || '🏆'}</span> {leagueState.leagueName}
                    </div>
                    {leagueSlot.matches.map((match) => (
                      <MatchRow 
                        key={match.id} 
                        match={match} 
                        isExpanded={selectedMatch === match.id} 
                        onToggle={() => setSelectedMatch(selectedMatch === match.id ? null : match.id)} 
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          );
        });
      })()}
      </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex justify-between items-center px-2 py-2 bg-[#1A1B2E] border-t border-gray-800">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'ADMIN') {
                handleAdminAccess();
              } else {
                setActiveNav(item.id);
                if (item.id === 'MORE') setShowMoreModal(true);
              }
            }}
            className={cn(
              "flex flex-col items-center justify-center w-12 h-12 rounded-lg",
              activeNav === item.id ? "text-[#FFC107]" : "text-gray-400"
            )}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-[9px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Admin Code Modal */}
      {showAdminCodeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#1A1B2E] p-8 rounded-2xl border border-gray-800 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">Accès Admin</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Code d'accès</label>
                <input 
                  type="password" 
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Entrez le code..."
                  className="w-full bg-[#2A2B4A] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFC107] transition-colors"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowAdminCodeModal(false)}
                  className="flex-1 bg-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-600 transition-colors"
                >
                  ANNULER
                </button>
                <button 
                  onClick={() => {
                    if (adminCode === '@9729') {
                      setIsAdmin(true);
                      setShowAdminCodeModal(false);
                      setActiveNav('ADMIN');
                    } else {
                      alert('Code incorrect');
                    }
                  }}
                  className="flex-1 bg-[#FFC107] text-black font-bold py-3 rounded-xl hover:bg-[#ffb300] transition-colors"
                >
                  VALIDER
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* More Modal */}
      {showMoreModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full h-[85vh] bg-[#0B1B3D] rounded-t-3xl p-6 flex flex-col animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">More</h2>
              <button 
                onClick={() => setShowMoreModal(false)}
                className="px-4 py-1.5 rounded-full border border-gray-600 text-sm font-medium text-white hover:bg-white/10"
              >
                Fermer
              </button>
            </div>
            
            <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto absolute top-3 left-1/2 -translate-x-1/2"></div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-6">
              {/* NOUVELLES SECTIONS */}
              <div>
                <h3 className="text-[#FFC107] font-bold mb-3">Outils & Administration</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => { setActiveNav('BEST'); setShowMoreModal(false); }}
                    className="bg-[#1A1B2E] border border-gray-700 rounded-xl p-4 cursor-pointer hover:bg-white/5"
                  >
                    <TrendingUp className="text-[#FFC107] mb-2" />
                    <h4 className="font-bold text-white text-sm">BEST PICKS</h4>
                    <p className="text-[10px] text-gray-400">Meilleurs choix</p>
                  </div>
                  <div 
                    onClick={() => { setActiveNav('ADMIN'); setShowMoreModal(false); handleAdminAccess(); }}
                    className="bg-[#1A1B2E] border border-gray-700 rounded-xl p-4 cursor-pointer hover:bg-white/5"
                  >
                    <MoreHorizontal className="text-[#FFC107] mb-2" />
                    <h4 className="font-bold text-white text-sm">ADMIN PANEL</h4>
                    <p className="text-[10px] text-gray-400">Gestion tokens & users</p>
                  </div>
                  <div 
                    onClick={() => { setActiveNav('VIP'); setShowMoreModal(false); }}
                    className="bg-[#1A1B2E] border border-gray-700 rounded-xl p-4 cursor-pointer hover:bg-white/5"
                  >
                    <Diamond className="text-[#FFC107] mb-2" />
                    <h4 className="font-bold text-white text-sm">VIP SECTION</h4>
                    <p className="text-[10px] text-gray-400">Pronostics exclusifs</p>
                  </div>
                  <div 
                    onClick={() => { setActiveNav('MULTIPLE'); setShowMoreModal(false); }}
                    className="bg-[#1A1B2E] border border-gray-700 rounded-xl p-4 cursor-pointer hover:bg-white/5"
                  >
                    <Trophy className="text-[#FFC107] mb-2" />
                    <h4 className="font-bold text-white text-sm">MULTIPLE</h4>
                    <p className="text-[10px] text-gray-400">Combinés du jour</p>
                  </div>
                  <div 
                    onClick={() => { setActiveNav('RESULTS'); setShowMoreModal(false); }}
                    className="bg-[#1A1B2E] border border-gray-700 rounded-xl p-4 cursor-pointer hover:bg-white/5"
                  >
                    <CheckCircle className="text-[#FFC107] mb-2" />
                    <h4 className="font-bold text-white text-sm">RÉSULTATS</h4>
                    <p className="text-[10px] text-gray-400">Scores passés</p>
                  </div>
                  <div 
                    onClick={() => { setActiveNav('STATS'); setShowMoreModal(false); }}
                    className="bg-[#1A1B2E] border border-gray-700 rounded-xl p-4 cursor-pointer hover:bg-white/5"
                  >
                    <BarChart2 className="text-[#FFC107] mb-2" />
                    <h4 className="font-bold text-white text-sm">STATS</h4>
                    <p className="text-[10px] text-gray-400">Classements & Forme</p>
                  </div>
                </div>
              </div>

              {/* Pronostics 85% */}
              <div>
                <h3 className="text-[#FFC107] font-bold mb-3">Pronostics 85% de réussite</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-4 cursor-pointer hover:bg-gray-100">
                    <h4 className="font-bold text-black mb-2">Matchs et cotes</h4>
                    {topPredictions.highConfidence[0] ? (
                      <div className="text-xs text-gray-600">
                        <div className="flex items-center gap-1 font-medium text-black">
                          <TeamLogo team={topPredictions.highConfidence[0].match.homeTeam} />
                          {topPredictions.highConfidence[0].match.homeTeam.name}
                        </div>
                        <div className="flex items-center gap-1 font-medium text-black mt-1">
                          <TeamLogo team={topPredictions.highConfidence[0].match.awayTeam} />
                          {topPredictions.highConfidence[0].match.awayTeam.name}
                        </div>
                        <div className="text-green-600 font-bold mt-2">
                          Pick: {topPredictions.highConfidence[0].prediction.matchCible.bestPrediction} ({topPredictions.highConfidence[0].prediction.matchCible.confidence}%)
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm font-medium">Aucun match</span>
                    )}
                  </div>
                  <div className="bg-white rounded-xl p-4 cursor-pointer hover:bg-gray-100">
                    <h4 className="font-bold text-black mb-2">Matchs du jour</h4>
                    {topPredictions.highConfidence[1] ? (
                      <div className="text-xs text-gray-600">
                        <div className="flex items-center gap-1 font-medium text-black">
                          <TeamLogo team={topPredictions.highConfidence[1].match.homeTeam} />
                          {topPredictions.highConfidence[1].match.homeTeam.name}
                        </div>
                        <div className="flex items-center gap-1 font-medium text-black mt-1">
                          <TeamLogo team={topPredictions.highConfidence[1].match.awayTeam} />
                          {topPredictions.highConfidence[1].match.awayTeam.name}
                        </div>
                        <div className="text-green-600 font-bold mt-2">
                          Pick: {topPredictions.highConfidence[1].prediction.matchCible.bestPrediction} ({topPredictions.highConfidence[1].prediction.matchCible.confidence}%)
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm font-medium">Aucun match</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pronostics sûrs */}
              <div>
                <h3 className="text-[#FFC107] font-bold mb-3">Pronostics sûrs du jour</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-4 cursor-pointer hover:bg-gray-100">
                    <h4 className="font-bold text-black mb-2">Over 1.5</h4>
                    {topPredictions.safeOver15[0] ? (
                      <div className="text-xs text-gray-600">
                        <div className="flex items-center gap-1 font-medium text-black">
                          <TeamLogo team={topPredictions.safeOver15[0].match.homeTeam} />
                          {topPredictions.safeOver15[0].match.homeTeam.name}
                        </div>
                        <div className="flex items-center gap-1 font-medium text-black mt-1">
                          <TeamLogo team={topPredictions.safeOver15[0].match.awayTeam} />
                          {topPredictions.safeOver15[0].match.awayTeam.name}
                        </div>
                        <div className="text-green-600 font-bold mt-2">Safe Over 1.5</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm font-medium">Aucun match</span>
                    )}
                  </div>
                  <div className="bg-white rounded-xl p-4 cursor-pointer hover:bg-gray-100">
                    <h4 className="font-bold text-black mb-2">BTTS</h4>
                    {topPredictions.btts[0] ? (
                      <div className="text-xs text-gray-600">
                        <div className="flex items-center gap-1 font-medium text-black">
                          <TeamLogo team={topPredictions.btts[0].match.homeTeam} />
                          {topPredictions.btts[0].match.homeTeam.name}
                        </div>
                        <div className="flex items-center gap-1 font-medium text-black mt-1">
                          <TeamLogo team={topPredictions.btts[0].match.awayTeam} />
                          {topPredictions.btts[0].match.awayTeam.name}
                        </div>
                        <div className="text-green-600 font-bold mt-2">Both Teams To Score</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm font-medium">Aucun match</span>
                    )}
                  </div>
                </div>
              </div>

              {/* VIP */}
              <div>
                <h3 className="text-[#FFC107] font-bold mb-3">Exclusif VIP</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1A1B2E] border border-[#FFC107] rounded-xl p-4 cursor-pointer relative overflow-hidden">
                    <div className="absolute top-3 right-3 bg-[#FFC107] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">Vip</div>
                    <h4 className="font-bold text-white mb-2">Over 2.5</h4>
                    {topPredictions.vipOver25[0] ? (
                      <div className="text-xs text-gray-300">
                        <div className="flex items-center gap-1 font-medium text-white">
                          <TeamLogo team={topPredictions.vipOver25[0].match.homeTeam} />
                          {topPredictions.vipOver25[0].match.homeTeam.name}
                        </div>
                        <div className="flex items-center gap-1 font-medium text-white mt-1">
                          <TeamLogo team={topPredictions.vipOver25[0].match.awayTeam} />
                          {topPredictions.vipOver25[0].match.awayTeam.name}
                        </div>
                        <div className="text-[#FFC107] font-bold mt-2">Over 2.5 Goals</div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm font-medium">Aucun match</span>
                    )}
                  </div>
                  <div className="bg-[#1A1B2E] border border-[#FFC107] rounded-xl p-4 cursor-pointer relative overflow-hidden">
                    <div className="absolute top-3 right-3 bg-[#FFC107] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">Vip</div>
                    <h4 className="font-bold text-white mb-2">High Odds</h4>
                    {topPredictions.vipHighOdds[0] ? (
                      <div className="text-xs text-gray-300">
                        <div className="flex items-center gap-1 font-medium text-white">
                          <TeamLogo team={topPredictions.vipHighOdds[0].match.homeTeam} />
                          {topPredictions.vipHighOdds[0].match.homeTeam.name}
                        </div>
                        <div className="flex items-center gap-1 font-medium text-white mt-1">
                          <TeamLogo team={topPredictions.vipHighOdds[0].match.awayTeam} />
                          {topPredictions.vipHighOdds[0].match.awayTeam.name}
                        </div>
                        <div className="text-[#FFC107] font-bold mt-2">
                          {topPredictions.vipHighOdds[0].prediction.vip.highOddsPrediction} (@{topPredictions.vipHighOdds[0].prediction.vip.highOddsValue})
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm font-medium">Aucun match</span>
                    )}
                  </div>
                  <div className="bg-[#1A1B2E] border border-[#FFC107] rounded-xl p-4 cursor-pointer relative overflow-hidden col-span-2">
                    <div className="absolute top-3 right-3 bg-[#FFC107] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">Vip</div>
                    <h4 className="font-bold text-white mb-2">Exact Score</h4>
                    {topPredictions.vipExactScore[0] ? (
                      <div className="text-xs text-gray-300 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-1 font-medium text-white">
                            <TeamLogo team={topPredictions.vipExactScore[0].match.homeTeam} />
                            {topPredictions.vipExactScore[0].match.homeTeam.name}
                          </div>
                          <div className="flex items-center gap-1 font-medium text-white mt-1">
                            <TeamLogo team={topPredictions.vipExactScore[0].match.awayTeam} />
                            {topPredictions.vipExactScore[0].match.awayTeam.name}
                          </div>
                        </div>
                        <div className="text-[#FFC107] font-bold text-lg">
                          {topPredictions.vipExactScore[0].prediction.vip.exactScoreAlt}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm font-medium">Aucun match</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
