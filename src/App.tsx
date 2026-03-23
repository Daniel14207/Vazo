import React, { useState, useMemo, useEffect } from 'react';
import { Menu, ShoppingCart, Star, ChevronRight, Clock, Flame, Trophy, TrendingUp, PlayCircle, Diamond, ArrowRightLeft, MoreHorizontal, CheckCircle, BarChart2, Plane, User, Lock, Phone, ShieldCheck, CreditCard, Send, Users, LogOut, Copy, Search } from 'lucide-react';
import { analyzeMatch } from './lib/predictionEngine';
import { cn } from './lib/utils';
import { leagues, teamsByLeague } from './lib/mockData';
import { useVirtualLeague } from './lib/virtualLeague';
import { getCurrentUser, setCurrentUser, getUsers, saveUsers, generateUserId, User as UserType } from './lib/auth';
import { motion, AnimatePresence } from 'motion/react';

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

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setUser] = useState<UserType | null>(getCurrentUser());
  const [isRegistering, setIsRegistering] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [tokenAmountToAdd, setTokenAmountToAdd] = useState<Record<string, string>>({});

  const filteredUsers = useMemo(() => {
    const users = getUsers();
    if (!adminSearch) return users;
    return users.filter(u => u.phone.includes(adminSearch));
  }, [adminSearch, showAdminPanel]);
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('All');
  const [activeNav, setActiveNav] = useState('TIPS');
  const [currentView, setCurrentView] = useState<'HOME' | 'VIRTUAL_FOOT' | 'AVIATOR_STUDIO'>('HOME');
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(1); // Default to today (index 1)
  const [aviatorSignals, setAviatorSignals] = useState<any[]>([]);
  const [isAnalyzingAviator, setIsAnalyzingAviator] = useState(false);
  const [aviatorInputTime, setAviatorInputTime] = useState('');
  const [aviatorInputRound, setAviatorInputRound] = useState('');
  const [aviatorAnalysisResult, setAviatorAnalysisResult] = useState<any[] | null>(null);

  const [virtualHistoryInput, setVirtualHistoryInput] = useState('');
  const [virtualMatchInput, setVirtualMatchInput] = useState('');
  const [virtualAnalysisResult, setVirtualAnalysisResult] = useState<any | null>(null);
  const [isAnalyzingVirtual, setIsAnalyzingVirtual] = useState(false);
  const [virtualStep, setVirtualStep] = useState(1);
  const [referenceTime, setReferenceTime] = useState<string | null>(null);

  // Generate initial aviator signals
  useEffect(() => {
    const generateSignals = () => {
      const signals = [];
      const now = new Date();
      for (let i = 0; i < 10; i++) {
        const time = new Date(now.getTime() + (i + 1) * 60000);
        const mult = (1.1 + Math.random() * 10).toFixed(2);
        signals.push({ time, mult });
      }
      setAviatorSignals(signals);
    };
    generateSignals();
    const interval = setInterval(generateSignals, 3600000); // Hourly sync
    return () => clearInterval(interval);
  }, []);

  const handleAviatorAnalysis = () => {
    if (!currentUser) return;
    if (currentUser.tokens <= 0) {
      alert('Veuillez activer vos tokens');
      return;
    }

    const todayStr = new Date().toLocaleDateString();
    const userDailyCount = currentUser.lastAnalysisDate === todayStr ? (currentUser.dailyAnalysisCount || 0) : 0;
    
    if (userDailyCount >= 20) {
      alert('Limite atteinte aujourd’hui');
      return;
    }

    if (!aviatorInputTime || !aviatorInputRound) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    setIsAnalyzingAviator(true);
    setAviatorAnalysisResult(null);
    setTimeout(() => {
      const rounds = aviatorInputRound.split(',').map(r => parseFloat(r.trim())).filter(r => !isNaN(r));
      const avg = rounds.length > 0 ? rounds.reduce((a, b) => a + b, 0) / rounds.length : 2.0;
      
      const newSignals = [];
      const [hours, minutes] = aviatorInputTime.split(':').map(Number);
      const baseTime = new Date();
      baseTime.setHours(hours || 12, minutes || 0, 0, 0);
      
      for (let i = 0; i < 5; i++) {
        const time = new Date(baseTime.getTime() + (i + 1) * 60000);
        const mult = (avg * (0.8 + Math.random() * 1.5)).toFixed(2);
        newSignals.push({ 
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          mult 
        });
      }
      
      setAviatorAnalysisResult(newSignals);
      setIsAnalyzingAviator(false);
      
      // Update user data
      const users = getUsers();
      const updatedUsers = users.map(u => {
        if (u.id === currentUser.id) {
          const historyItem = {
            time: new Date().toLocaleTimeString(),
            type: 'Aviator' as const,
            result: `FIXED Future Rounds: ${newSignals.map(s => s.mult + 'x').join(', ')}`
          };
          const newCount = (u.lastAnalysisDate === todayStr ? (u.dailyAnalysisCount || 0) : 0) + 1;
          return {
            ...u,
            tokens: u.tokens - 1,
            dailyAnalysisCount: newCount,
            lastAnalysisDate: todayStr,
            analysisHistory: [historyItem, ...(u.analysisHistory || [])].slice(0, 50),
            estimatedGains: (u.estimatedGains || 0) + (Math.random() > 0.4 ? 1500 : 0),
            estimatedLosses: (u.estimatedLosses || 0) + (Math.random() > 0.8 ? 500 : 0)
          };
        }
        return u;
      });
      saveUsers(updatedUsers);
      const updatedUser = updatedUsers.find(u => u.id === currentUser.id)!;
      setUser(updatedUser);
      setCurrentUser(updatedUser);
    }, 3000);
  };

  const handleVirtualAnalysis = () => {
    if (!currentUser) return;
    if (currentUser.tokens <= 0) {
      alert('Veuillez activer vos tokens');
      return;
    }

    const todayStr = new Date().toLocaleDateString();
    const userDailyCount = currentUser.lastAnalysisDate === todayStr ? (currentUser.dailyAnalysisCount || 0) : 0;
    
    if (userDailyCount >= 20) {
      alert('Limite atteinte aujourd’hui');
      return;
    }

    if (!virtualMatchInput) {
      alert('Veuillez entrer le match à analyser');
      return;
    }

    setIsAnalyzingVirtual(true);
    setVirtualAnalysisResult(null);
    setTimeout(() => {
      // Simple logic to extract teams and odds
      const parts = virtualMatchInput.split('|');
      const teamsPart = parts[0].split('vs');
      const homeTeam = teamsPart[0]?.trim() || 'Team A';
      const awayTeam = teamsPart[1]?.trim() || 'Team B';
      
      // Generate realistic analysis based on "history" if provided
      const historyScore = virtualHistoryInput.match(/(\d+)-(\d+)/);
      const hScore = historyScore ? parseInt(historyScore[1]) : 1;
      const aScore = historyScore ? parseInt(historyScore[2]) : 1;

      const result = {
        match: `${homeTeam} vs ${awayTeam}`,
        '1X2': hScore > aScore ? '1' : aScore > hScore ? '2' : 'X',
        'HT 1X2': hScore >= aScore ? '1' : 'X',
        'Double Chance': hScore > aScore ? '1X' : aScore > hScore ? 'X2' : '12',
        'Score Exact': `${hScore + 1}-${aScore}`,
        'Over/Under': 'Over 2.5',
        'HT/FT': hScore > aScore ? '1/1' : 'X/2',
        'GG/NG': 'GG',
        odds: {
          '1': (1.5 + Math.random()).toFixed(2),
          'X': (3.0 + Math.random()).toFixed(2),
          '2': (2.5 + Math.random()).toFixed(2)
        }
      };

      setVirtualAnalysisResult(result);
      setIsAnalyzingVirtual(false);
      
      // Set reference time for sync
      const now = new Date();
      setReferenceTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      // Update user data
      const users = getUsers();
      const updatedUsers = users.map(u => {
        if (u.id === currentUser.id) {
          const historyItem = {
            time: new Date().toLocaleTimeString(),
            type: 'Virtuel' as const,
            result: `Pronostic: ${result['1X2']} | Score: ${result['Score Exact']}`,
            match: result.match
          };
          const newCount = (u.lastAnalysisDate === todayStr ? (u.dailyAnalysisCount || 0) : 0) + 1;
          return {
            ...u,
            tokens: u.tokens - 1,
            dailyAnalysisCount: newCount,
            lastAnalysisDate: todayStr,
            analysisHistory: [historyItem, ...(u.analysisHistory || [])].slice(0, 50),
            estimatedGains: (u.estimatedGains || 0) + (Math.random() > 0.5 ? 2500 : 0),
            estimatedLosses: (u.estimatedLosses || 0) + (Math.random() > 0.8 ? 1000 : 0)
          };
        }
        return u;
      });
      saveUsers(updatedUsers);
      const updatedUser = updatedUsers.find(u => u.id === currentUser.id)!;
      setUser(updatedUser);
      setCurrentUser(updatedUser);
    }, 5000);
  };

  const handleAddTokens = (userId: string, amount: number) => {
    const users = getUsers();
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const newTokens = u.tokens + amount;
        // Set expiration to 30 days from now if not set or expired
        const currentExp = u.expirationDate ? new Date(u.expirationDate) : null;
        const now = new Date();
        const newExp = (!currentExp || currentExp < now) 
          ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          : new Date(currentExp.getTime() + 30 * 24 * 60 * 60 * 1000);
          
        return {
          ...u,
          tokens: newTokens,
          expirationDate: newExp.toISOString()
        };
      }
      return u;
    });
    saveUsers(updatedUsers);
    
    // If current user was updated, sync state
    if (currentUser && userId === currentUser.id) {
      const updatedUser = updatedUsers.find(u => u.id === userId)!;
      setUser(updatedUser);
      setCurrentUser(updatedUser);
    }
    alert(`Tokens ajoutés avec succès !`);
  };

  const leagueStates = useVirtualLeague();
  const firstLeague = leagueStates[0];

  // Splash screen timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Sync user tokens from localStorage
  useEffect(() => {
    if (currentUser) {
      const users = getUsers();
      const updatedUser = users.find(u => u.id === currentUser.id);
      if (updatedUser) {
        setUser(updatedUser);
        setCurrentUser(updatedUser);
      }
    }
  }, [activeNav]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = getUsers();
    const user = users.find(u => u.phone === phone && u.password === password);
    if (user) {
      setUser(user);
      setCurrentUser(user);
    } else {
      setError('Numéro ou mot de passe incorrect');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!/^\d{4,6}$/.test(password)) {
      setError('Le mot de passe doit contenir entre 4 et 6 chiffres');
      return;
    }

    const users = getUsers();
    if (users.find(u => u.phone === phone)) {
      setError('Ce numéro est déjà utilisé');
      return;
    }

    const newUser: UserType = {
      id: generateUserId(),
      phone,
      password,
      tokens: 0,
      expirationDate: null,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    setUser(newUser);
    setCurrentUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentUser(null);
    setActiveNav('TIPS');
  };

  const handleAdminAccess = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAdminCode(val);
    if (val === '@9729') {
      setShowAdminPanel(true);
      setAdminCode('');
    }
  };

  const isTokenActive = (user: UserType | null) => {
    if (!user) return false;
    if (user.tokens <= 0) return false;
    if (!user.expirationDate) return false;
    return new Date(user.expirationDate) > new Date();
  };

  const hasAccess = isTokenActive(currentUser);

  const topPredictions = useMemo<{
    highConfidence: any[];
    safeOver15: any[];
    btts: any[];
    vipOver25: any[];
    vipHighOdds: any[];
    vipExactScore: any[];
  }>(() => {
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

  const multipleBets = useMemo<Record<string, any[]>>(() => {
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
  const navItems = [ 
    { id: 'TIPS', icon: <Flame size={20} />, label: 'TIPS' }, 
    { id: 'MULTIPLE', icon: <Trophy size={20} />, label: 'MULTIPLE' }, 
    { id: 'BEST', icon: <TrendingUp size={20} />, label: 'BEST' }, 
    { id: 'LIVE', icon: <PlayCircle size={20} />, label: 'LIVE' }, 
    { id: 'VIP', icon: <Diamond size={20} />, label: 'VIP RESULT' }, 
    { id: 'STATUS', icon: <CheckCircle size={20} />, label: 'HISTORIQUE' }, 
    { id: 'ANALYSE', icon: <BarChart2 size={20} />, label: 'ANALYSE' },
    { id: 'ADMIN_NAV', icon: <ShieldCheck size={20} />, label: 'ADMIN' }
  ];

  const aviatorNavItems = [
    { id: 'TIPS', icon: <Flame size={20} />, label: 'TIPS' },
    { id: 'LIVE', icon: <PlayCircle size={20} />, label: 'LIVE' },
    { id: 'HISTORY', icon: <Clock size={20} />, label: 'HISTORY' },
    { id: 'ANALYSE', icon: <BarChart2 size={20} />, label: 'ANALYSE' },
    { id: 'BEST', icon: <TrendingUp size={20} />, label: 'BEST' },
    { id: 'VIP', icon: <Diamond size={20} />, label: 'VIP' },
    { id: 'ADMIN_NAV', icon: <ShieldCheck size={20} />, label: 'ADMIN' }
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-[#1A1B2E] text-white font-sans overflow-hidden">
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#1A1B2E] flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-24 h-24 bg-[#FFC107] rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,193,7,0.3)] animate-pulse">
              <Trophy size={48} className="text-black" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2 tracking-wider">VITAL PRONOSTIC</h1>
            <p className="text-blue-200 text-sm font-medium animate-pulse">System initialization...</p>
            <div className="mt-8 w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="h-full bg-[#FFC107]"
              />
            </div>
          </motion.div>
        )}

        {!currentUser && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 z-[90] bg-[#1A1B2E] flex flex-col p-6 overflow-y-auto"
          >
            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#FFC107] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="text-black" />
                </div>
                <h2 className="text-2xl font-bold text-white">{isRegistering ? 'Créer un compte' : 'Connexion'}</h2>
                <p className="text-gray-400 text-sm mt-2">
                  {isRegistering ? 'Rejoignez VITAL PRONOSTIC aujourd\'hui' : 'Accédez à vos pronostics VIP'}
                </p>
              </div>

              <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Numéro de téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="034 XX XXX XX"
                      className="w-full bg-[#2A2B4A] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FFC107] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Mot de passe (4-6 chiffres)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      className="w-full bg-[#2A2B4A] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FFC107] transition-colors"
                    />
                  </div>
                </div>

                {isRegistering && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Confirmer le mot de passe</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="password" 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="••••••"
                        className="w-full bg-[#2A2B4A] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FFC107] transition-colors"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-lg text-center">
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-[#FFC107] hover:bg-[#ffb300] text-black font-black py-3 rounded-xl shadow-lg shadow-[#FFC107]/20 transition-all transform active:scale-95"
                >
                  {isRegistering ? 'S\'INSCRIRE' : 'SE CONNECTER'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                  }}
                  className="text-sm text-blue-400 font-medium hover:text-blue-300 transition-colors"
                >
                  {isRegistering ? 'Déjà un compte ? Connectez-vous' : 'Pas de compte ? Inscrivez-vous'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {showAdminPanel && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[110] bg-[#0B1B3D] flex flex-col p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="text-[#FFC107]" /> ADMIN PANEL
              </h2>
              <button 
                onClick={() => setShowAdminPanel(false)}
                className="p-2 bg-gray-800 rounded-lg text-white"
              >
                Fermer
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="sticky top-0 z-10 bg-[#0B1B3D] pb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    type="text"
                    placeholder="Rechercher un numéro..."
                    className="w-full bg-[#1A1B2E] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#FFC107]"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                  />
                </div>
              </div>

              {filteredUsers.map(u => {
                const active = isTokenActive(u);
                return (
                  <div key={u.id} className="bg-[#1A1B2E] p-4 rounded-xl border border-gray-800">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">ID: {u.id}</div>
                        <div className="text-sm font-bold text-white">{u.phone}</div>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                        active ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                      )}>
                        {active ? 'Actif' : 'Expiré'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                      <div>
                        <div className="text-gray-500 mb-0.5">Tokens</div>
                        <div className="text-white font-bold">{u.tokens}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-0.5">Expiration</div>
                        <div className="text-white font-bold">{u.expirationDate ? new Date(u.expirationDate).toLocaleDateString() : 'N/A'}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const amount = prompt('Entrer montant (ex: 5000, 10000, 40000)');
                          if (amount) {
                            const val = parseInt(amount);
                            let days = 0;
                            if (val >= 40000) days = 30;
                            else if (val >= 10000) days = 7;
                            else if (val >= 5000) days = 3;
                            else days = Math.max(1, Math.floor(val / 1500));

                            const users = getUsers();
                            const userIdx = users.findIndex(usr => usr.id === u.id);
                            if (userIdx !== -1) {
                              const expDate = new Date();
                              expDate.setDate(expDate.getDate() + days);
                              users[userIdx].tokens = val;
                              users[userIdx].expirationDate = expDate.toISOString();
                              saveUsers(users);
                              alert(`Tokens activés pour ${days} jours`);
                              // Force refresh
                              setShowAdminPanel(false);
                              setTimeout(() => setShowAdminPanel(true), 10);
                            }
                          }
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Send size={14} /> ACTIVER TOKENS
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="pt-10 flex justify-center opacity-10 hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    const code = prompt("Code Admin:");
                    if (code === "@9729") {
                      setShowAdminPanel(true);
                      setShowMoreModal(false);
                    }
                  }}
                  className="text-[10px] text-gray-600 uppercase tracking-widest"
                >
                  System Access
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#1A1B2E] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 bg-[#FFC107] rounded-md text-black"
          >
            <Menu size={24} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">ID: {currentUser?.id || '---'}</span>
            <div className="flex items-center gap-1">
              <input 
                type="password" 
                value={adminCode}
                onChange={handleAdminAccess}
                placeholder="••••"
                className="w-12 bg-transparent text-transparent border-none focus:outline-none cursor-default"
              />
            </div>
          </div>
        </div>
        <h1 
          onClick={() => setCurrentView('HOME')}
          className="text-xl font-black text-[#FFC107] tracking-tighter italic cursor-pointer"
        >
          VITAL PRONOSTIC
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-[#FFC107] uppercase">Tokens</span>
            <span className="text-sm font-black text-white">{currentUser?.tokens || 0}</span>
          </div>
          <button onClick={handleLogout} className="p-2 bg-red-500/20 rounded-md text-red-500">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Hamburger Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[120] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#1A1B2E] z-[130] shadow-2xl border-r border-gray-800 flex flex-col"
            >
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-[#FFC107] italic">MENU</h2>
                  <button onClick={() => setIsMenuOpen(false)} className="text-gray-400">
                    <ChevronRight className="rotate-180" />
                  </button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#2A2B4A] rounded-xl">
                  <div className="w-10 h-10 bg-[#FFC107] rounded-lg flex items-center justify-center text-black font-bold">
                    {currentUser?.phone.substring(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{currentUser?.phone}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ID: {currentUser?.id}</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <button 
                  onClick={() => { setCurrentView('VIRTUAL_FOOT'); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#2A2B4A] transition-colors text-left"
                >
                  <Trophy className="text-[#FFC107]" size={20} />
                  <span className="font-bold text-sm">VIRTUEL FOOT</span>
                </button>
                <button 
                  onClick={() => { setCurrentView('AVIATOR_STUDIO'); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#2A2B4A] transition-colors text-left"
                >
                  <Plane className="text-[#FFC107]" size={20} />
                  <span className="font-bold text-sm">AVIATOR STUDIO</span>
                </button>
                <div className="h-px bg-gray-800 my-4" />
                <button 
                  onClick={() => { window.open('https://t.me/vital_admin', '_blank'); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#2A2B4A] transition-colors text-left"
                >
                  <Phone className="text-blue-400" size={20} />
                  <span className="font-bold text-sm">CONTACT ADMIN</span>
                </button>
                <button 
                  onClick={() => { 
                    const code = prompt("Code Admin:");
                    if (code === "@9729") {
                      setShowAdminPanel(true);
                    }
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#2A2B4A] transition-colors text-left"
                >
                  <ShieldCheck className="text-green-400" size={20} />
                  <span className="font-bold text-sm">ADMIN PANEL</span>
                </button>
              </div>

              <div className="p-4 border-t border-gray-800">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm"
                >
                  <LogOut size={18} />
                  DÉCONNEXION
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Date Selector */}
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

      {/* Filter Tabs */}
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-white text-black relative">
        <AnimatePresence mode="wait">
          {currentView === 'HOME' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 space-y-6 bg-[#1A1B2E] h-full"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-white italic tracking-tighter">BIENVENUE</h2>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-2">Choisissez votre service</p>
              </div>

              <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
                <button 
                  onClick={() => setCurrentView('VIRTUAL_FOOT')}
                  className="group relative overflow-hidden bg-[#2A2B4A] p-8 rounded-3xl border border-gray-800 hover:border-[#FFC107] transition-all"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Trophy size={120} />
                  </div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-[#FFC107] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#FFC107]/20">
                      <Trophy size={32} className="text-black" />
                    </div>
                    <h3 className="text-2xl font-black text-white italic">VIRTUEL FOOT</h3>
                    <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-widest">Analyses & Pronostics</p>
                    <div className="mt-6 flex items-center gap-2 text-[#FFC107] font-black text-sm">
                      ACCÉDER <ChevronRight size={18} />
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => setCurrentView('AVIATOR_STUDIO')}
                  className="group relative overflow-hidden bg-[#2A2B4A] p-8 rounded-3xl border border-gray-800 hover:border-[#FFC107] transition-all"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Plane size={120} />
                  </div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-[#FFC107] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#FFC107]/20">
                      <Plane size={32} className="text-black" />
                    </div>
                    <h3 className="text-2xl font-black text-white italic">AVIATOR STUDIO</h3>
                    <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-widest">Signaux & Algorithmes</p>
                    <div className="mt-6 flex items-center gap-2 text-[#FFC107] font-black text-sm">
                      ACCÉDER <ChevronRight size={18} />
                    </div>
                  </div>
                </button>
              </div>

              <div className="pt-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                  <ShieldCheck size={14} className="text-green-500" />
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Système Sécurisé v2.5</span>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'VIRTUAL_FOOT' && (
            <motion.div 
              key="virtual_foot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full bg-white"
            >
              {/* Virtual Foot Navigation */}
              <div className="bg-[#1A1B2E] px-2 py-2 flex overflow-x-auto no-scrollbar gap-2 border-b border-gray-800">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={cn(
                      "flex flex-col items-center justify-center min-w-[70px] py-2 rounded-xl transition-all",
                      activeNav === item.id ? "bg-[#FFC107] text-black" : "text-gray-400 hover:text-white"
                    )}
                  >
                    {item.icon}
                    <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Virtual Foot Content */}
              <div className="flex-1 overflow-y-auto">
                {!hasAccess && ['LIVE', 'VIP', 'MULTIPLE', 'BEST'].includes(activeNav) ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50">
                    <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mb-6">
                      <Lock size={40} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-black text-[#1A1B2E] mb-2 uppercase">ACCÈS RESTREINT</h3>
                    <p className="text-gray-500 text-sm font-medium mb-8">Veuillez activer vos tokens pour accéder à cette section VIP.</p>
                    <button 
                      onClick={() => window.open('https://t.me/vital_admin', '_blank')}
                      className="bg-[#1A1B2E] text-[#FFC107] font-black py-4 px-8 rounded-2xl shadow-xl flex items-center gap-2"
                    >
                      ACTIVER MES TOKENS <ShoppingCart size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="p-0">
                    {/* Virtual Foot Logic */}
                    {activeNav === 'TIPS' && (
                      <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-black text-[#1A1B2E] italic">TOP PRONOSTICS</h3>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Mis à jour: {formatTime(new Date())}</span>
                        </div>
                        {topPredictions.highConfidence.slice(0, 10).map((item, idx) => (
                          <MatchRow 
                            key={item.match.id} 
                            match={item.match} 
                            isExpanded={selectedMatch === item.match.id}
                            onToggle={() => setSelectedMatch(selectedMatch === item.match.id ? null : item.match.id)}
                          />
                        ))}
                      </div>
                    )}

                    {activeNav === 'MULTIPLE' && (
                      <div className="p-4 space-y-6">
                        <div className="bg-[#1A1B2E] p-4 rounded-2xl text-white">
                          <div className="flex items-center gap-2 mb-2">
                            <Trophy className="text-[#FFC107]" size={20} />
                            <h3 className="font-black italic">COMBINÉS DU JOUR</h3>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sélections haute probabilité par ligue</p>
                        </div>

                        {Object.entries(multipleBets).map(([leagueName, leagueBets]) => {
                          const bets = leagueBets as any[];
                          return (
                            <div key={leagueName} className="space-y-3">
                              <div className="flex items-center gap-2 border-b-2 border-[#1A1B2E] pb-1">
                                <span className="font-black text-[#1A1B2E] uppercase text-sm italic">{leagueName}</span>
                                <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-500">{bets.length} MATCHS</span>
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                {bets.map((bet, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                                        <span>{bet.match.homeTeam.name}</span>
                                        <span className="text-gray-400">vs</span>
                                        <span>{bet.match.awayTeam.name}</span>
                                      </div>
                                      <div className="text-[10px] text-gray-500 mt-1 font-medium">{bet.betType}: <span className="text-[#1A1B2E] font-bold">{bet.selection}</span></div>
                                    </div>
                                    <div className="text-sm font-black text-[#1A1B2E]">@{bet.odds.toFixed(2)}</div>
                                  </div>
                                ))}
                              </div>
                              <div className="bg-[#1A1B2E] p-3 rounded-xl flex justify-between items-center">
                                <span className="text-xs font-bold text-[#FFC107]">COTE TOTALE</span>
                                <span className="text-lg font-black text-white italic">
                                  @{bets.reduce((acc, b) => acc * b.odds, 1).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {activeNav === 'BEST' && (
                      <div className="p-4 space-y-4">
                        <div className="bg-gradient-to-r from-[#1A1B2E] to-[#2A2B4A] p-6 rounded-3xl text-white relative overflow-hidden">
                          <TrendingUp className="absolute -right-4 -bottom-4 text-white/5" size={120} />
                          <h3 className="text-2xl font-black italic mb-1">BEST PICKS</h3>
                          <p className="text-xs font-bold text-[#FFC107] uppercase tracking-widest">Algorithme de confiance 95%+</p>
                        </div>
                        {topPredictions.highConfidence.slice(0, 5).map((item, idx) => (
                          <div key={idx} className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-black bg-green-100 text-green-700 px-2 py-1 rounded uppercase tracking-wider">Confiance: {item.prediction.matchCible.confidence}%</span>
                              <span className="text-[10px] font-bold text-gray-400">{formatTime(new Date(item.match.date))}</span>
                            </div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex flex-col items-center gap-1 flex-1">
                                <TeamLogo team={item.match.homeTeam} />
                                <span className="text-xs font-bold text-center">{item.match.homeTeam.name}</span>
                              </div>
                              <div className="px-4 font-black text-gray-300">VS</div>
                              <div className="flex flex-col items-center gap-1 flex-1">
                                <TeamLogo team={item.match.awayTeam} />
                                <span className="text-xs font-bold text-center">{item.match.awayTeam.name}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1 bg-gray-50 p-2 rounded-xl text-center">
                                <div className="text-[9px] font-bold text-gray-400 uppercase">Pronostic</div>
                                <div className="text-sm font-black text-[#1A1B2E]">{item.prediction.matchCible.bestPrediction}</div>
                              </div>
                              <div className="flex-1 bg-[#1A1B2E] p-2 rounded-xl text-center">
                                <div className="text-[9px] font-bold text-[#FFC107] uppercase">Score Exact</div>
                                <div className="text-sm font-black text-white italic">{item.prediction.matchCible.exactScore}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeNav === 'LIVE' && (
                      <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            <h3 className="font-black text-[#1A1B2E] italic">MATCHS EN DIRECT</h3>
                          </div>
                          {firstLeague.isBreak && (
                            <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-1 rounded animate-pulse">
                              NEW CYCLE IN: {Math.floor(firstLeague.breakTimeRemaining / 1000 / 60)}m {Math.floor((firstLeague.breakTimeRemaining / 1000) % 60)}s
                            </span>
                          )}
                        </div>
                        
                        {leagueStates.map(league => {
                          const liveMatches = league.slots.flatMap(s => s.matches).filter(m => m.status === 'LIVE');
                          if (liveMatches.length === 0) return null;
                          return (
                            <div key={league.leagueId} className="space-y-2">
                              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                                {league.leagueLogo && <img src={league.leagueLogo} alt={league.leagueName} className="w-4 h-4 object-contain" />}
                                <span className="text-[10px] font-black text-gray-500 uppercase">{league.leagueName}</span>
                              </div>
                              {liveMatches.map(match => (
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

                        {leagueStates.every(l => l.slots.flatMap(s => s.matches).filter(m => m.status === 'LIVE').length === 0) && (
                          <div className="py-20 text-center">
                            <PlayCircle size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400 font-bold text-sm uppercase">Aucun match en direct</p>
                            <p className="text-gray-300 text-xs mt-1">Les prochains matchs débutent bientôt</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeNav === 'VIP' && (
                      <div className="p-4 space-y-6">
                        <div className="bg-[#1A1B2E] p-6 rounded-3xl text-white border-b-4 border-[#FFC107]">
                          <div className="flex items-center gap-2 mb-2">
                            <Diamond className="text-[#FFC107]" size={24} />
                            <h3 className="text-xl font-black italic">VIP RESULT ENGINE</h3>
                          </div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Algorithme prédictif haute précision</p>
                        </div>

                        {leagueStates.map(league => {
                          const futureSlots = league.slots.filter(s => s.status === 'OPEN').slice(0, 3);
                          return (
                            <div key={league.leagueId} className="space-y-4">
                              <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
                                <span className="font-black text-[#1A1B2E] uppercase text-sm italic">{league.leagueName}</span>
                              </div>
                              {futureSlots.map((slot, sIdx) => (
                                <div key={sIdx} className="space-y-2">
                                  <div className="text-[10px] font-black text-gray-400 flex items-center gap-1">
                                    <Clock size={10} /> {formatTime(slot.time)}
                                  </div>
                                  <div className="grid grid-cols-1 gap-2">
                                    {slot.matches.slice(0, 2).map((match, mIdx) => {
                                      const pred = analyzeMatch(match);
                                      return (
                                        <div key={mIdx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                          <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-bold">{match.homeTeam.name}</span>
                                              <span className="text-gray-300">vs</span>
                                              <span className="text-xs font-bold">{match.awayTeam.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded">WIN: {pred.matchCible.confidence}%</span>
                                          </div>
                                          <div className="grid grid-cols-3 gap-2">
                                            <div className="bg-white p-2 rounded-xl border text-center">
                                              <div className="text-[8px] font-bold text-gray-400 uppercase">1X2</div>
                                              <div className="text-xs font-black">{pred.matchCible.bestPrediction}</div>
                                            </div>
                                            <div className="bg-white p-2 rounded-xl border text-center">
                                              <div className="text-[8px] font-bold text-gray-400 uppercase">Score</div>
                                              <div className="text-xs font-black">{pred.matchCible.exactScore}</div>
                                            </div>
                                            <div className="bg-[#1A1B2E] p-2 rounded-xl text-center">
                                              <div className="text-[8px] font-bold text-[#FFC107] uppercase">VIP</div>
                                              <div className="text-xs font-black text-white italic">{pred.vip.exactScoreAlt}</div>
                                            </div>
                                          </div>
                                          <div className="mt-3 grid grid-cols-2 gap-2">
                                            <div className="text-[9px] font-bold text-gray-500">HT/FT: <span className="text-black">{pred.vip.comboBet.split('&')[0]}</span></div>
                                            <div className="text-[9px] font-bold text-gray-500">O/U 2.5: <span className="text-black">{pred.advanced.over25 ? 'Over' : 'Under'}</span></div>
                                            <div className="text-[9px] font-bold text-gray-500">GG/NG: <span className="text-black">{pred.advanced.btts ? 'GG' : 'NG'}</span></div>
                                            <div className="text-[9px] font-bold text-gray-500">D. Chance: <span className="text-black">{pred.safeBets.doubleChance}</span></div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {activeNav === 'STATUS' && (
                      <div className="p-4 space-y-4">
                        <div className="bg-[#1A1B2E] p-6 rounded-3xl text-white">
                          <h3 className="text-xl font-black italic mb-2">VOTRE PROFIT</h3>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-white/10 p-3 rounded-xl">
                              <div className="text-[10px] text-gray-400 uppercase font-bold">Gains Estimes</div>
                              <div className="text-lg font-black text-green-400">+{currentUser?.estimatedGains || 0} F</div>
                            </div>
                            <div className="bg-white/10 p-3 rounded-xl">
                              <div className="text-[10px] text-gray-400 uppercase font-bold">Pertes Estimees</div>
                              <div className="text-lg font-black text-red-400">-{currentUser?.estimatedLosses || 0} F</div>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                            <span className="text-sm font-bold">Profit Total</span>
                            <span className="text-xl font-black text-[#FFC107]">{(currentUser?.estimatedGains || 0) - (currentUser?.estimatedLosses || 0)} F</span>
                          </div>
                        </div>

                        <h4 className="font-black text-[#1A1B2E] italic uppercase tracking-wider mt-6">Historique d'Analyse</h4>
                        <div className="space-y-3">
                          {currentUser?.analysisHistory?.map((item, i) => (
                            <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black bg-[#1A1B2E] text-white px-2 py-0.5 rounded uppercase">{item.type}</span>
                                <span className="text-[10px] font-bold text-gray-400">{item.time}</span>
                              </div>
                              {item.match && <div className="text-xs font-black text-gray-800 mb-1">{item.match}</div>}
                              <div className="text-xs font-medium text-gray-600">{item.result}</div>
                            </div>
                          ))}
                          {(!currentUser?.analysisHistory || currentUser.analysisHistory.length === 0) && (
                            <div className="py-10 text-center text-gray-400 text-sm italic">Aucun historique disponible</div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeNav === 'ANALYSE' && (
                      <div className="p-4 space-y-6">
                        <div className="bg-[#1A1B2E] p-6 rounded-3xl text-white">
                          <h3 className="text-xl font-black italic mb-2">VIRTUAL ANALYZER</h3>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Analyse structurée par IA</p>
                        </div>

                        <div className="space-y-6">
                          {virtualStep === 1 ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                <h4 className="text-xs font-black text-blue-800 uppercase mb-2">Étape 1: Historique</h4>
                                <textarea 
                                  value={virtualHistoryInput}
                                  onChange={(e) => setVirtualHistoryInput(e.target.value)}
                                  placeholder="Ex: Team A 2-1 Team B"
                                  className="w-full bg-white border border-blue-200 rounded-xl p-4 text-sm font-bold focus:outline-none focus:border-blue-500 min-h-[80px]"
                                />
                                <button 
                                  onClick={() => setVirtualStep(2)}
                                  className="w-full mt-3 bg-blue-600 text-white font-black py-3 rounded-xl shadow-lg shadow-blue-600/20 uppercase text-xs"
                                >
                                  Sauvegarder
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                              <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                                <h4 className="text-xs font-black text-green-800 uppercase mb-2">Étape 2: Match à Analyser</h4>
                                <textarea 
                                  value={virtualMatchInput}
                                  onChange={(e) => setVirtualMatchInput(e.target.value)}
                                  placeholder="Ex: Team A vs Team B | cote 1 | X | 2"
                                  className="w-full bg-white border border-green-200 rounded-xl p-4 text-sm font-bold focus:outline-none focus:border-green-500 min-h-[80px]"
                                />
                                <div className="flex gap-2 mt-3">
                                  <button 
                                    onClick={() => setVirtualStep(1)}
                                    className="flex-1 bg-gray-200 text-gray-600 font-black py-3 rounded-xl uppercase text-xs"
                                  >
                                    Retour
                                  </button>
                                  <button 
                                    onClick={handleVirtualAnalysis}
                                    disabled={isAnalyzingVirtual}
                                    className="flex-[2] bg-green-600 text-white font-black py-3 rounded-xl shadow-lg shadow-green-600/20 uppercase text-xs flex items-center justify-center gap-2"
                                  >
                                    {isAnalyzingVirtual ? 'Analyse...' : 'Analyse'} <BarChart2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {isAnalyzingVirtual && (
                            <div className="py-10 flex flex-col items-center justify-center space-y-4">
                              <div className="w-12 h-12 border-4 border-[#1A1B2E] border-t-transparent rounded-full animate-spin" />
                              <p className="text-sm font-black text-[#1A1B2E] animate-pulse">CALCUL DES PROBABILITÉS...</p>
                            </div>
                          )}

                          {virtualAnalysisResult && !isAnalyzingVirtual && (
                            <div className="bg-white border-2 border-[#1A1B2E] rounded-3xl overflow-hidden shadow-xl animate-in zoom-in-95 duration-300">
                              <div className="bg-[#1A1B2E] p-4 text-center">
                                <h4 className="text-white font-black italic">{virtualAnalysisResult.match}</h4>
                                <div className="text-[10px] text-[#FFC107] font-bold uppercase mt-1">Résultats de l'Analyse</div>
                              </div>
                              <div className="p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="text-[8px] font-bold text-gray-400 uppercase">1X2</div>
                                    <div className="text-sm font-black text-[#1A1B2E]">{virtualAnalysisResult['1X2']}</div>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="text-[8px] font-bold text-gray-400 uppercase">HT 1X2</div>
                                    <div className="text-sm font-black text-[#1A1B2E]">{virtualAnalysisResult['HT 1X2']}</div>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="text-[8px] font-bold text-gray-400 uppercase">Double Chance</div>
                                    <div className="text-sm font-black text-[#1A1B2E]">{virtualAnalysisResult['Double Chance']}</div>
                                  </div>
                                  <div className="bg-[#1A1B2E] p-3 rounded-xl">
                                    <div className="text-[8px] font-bold text-[#FFC107] uppercase">Score Exact</div>
                                    <div className="text-sm font-black text-white italic">{virtualAnalysisResult['Score Exact']}</div>
                                  </div>
                                </div>
                                <div className="space-y-2 pt-2">
                                  <div className="flex justify-between items-center text-xs border-b pb-1">
                                    <span className="text-gray-500 font-bold">Over/Under</span>
                                    <span className="font-black text-[#1A1B2E]">{virtualAnalysisResult['Over/Under']}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs border-b pb-1">
                                    <span className="text-gray-500 font-bold">HT/FT</span>
                                    <span className="font-black text-[#1A1B2E]">{virtualAnalysisResult['HT/FT']}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-bold">GG/NG</span>
                                    <span className="font-black text-[#1A1B2E]">{virtualAnalysisResult['GG/NG']}</span>
                                  </div>
                                </div>
                                <div className="mt-4 bg-yellow-50 p-3 rounded-xl border border-yellow-100 flex justify-between items-center">
                                  <span className="text-[10px] font-black text-yellow-800">COTES ESTIMÉES</span>
                                  <div className="flex gap-3 text-xs font-black">
                                    <span>1: {virtualAnalysisResult.odds['1']}</span>
                                    <span>X: {virtualAnalysisResult.odds['X']}</span>
                                    <span>2: {virtualAnalysisResult.odds['2']}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentView === 'AVIATOR_STUDIO' && (
            <motion.div 
              key="aviator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full bg-[#1A1B2E]"
            >
              {/* Aviator Navigation */}
              <div className="bg-[#0B0C1A] px-2 py-2 flex overflow-x-auto no-scrollbar gap-2 border-b border-gray-900">
                {aviatorNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={cn(
                      "flex flex-col items-center justify-center min-w-[70px] py-2 rounded-xl transition-all",
                      activeNav === item.id ? "bg-red-600 text-white" : "text-gray-500 hover:text-white"
                    )}
                  >
                    {item.icon}
                    <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Aviator Content */}
              <div className="flex-1 overflow-y-auto">
                {!hasAccess && ['LIVE', 'VIP', 'ANALYSE', 'BEST'].includes(activeNav) ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
                      <Lock size={40} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2 uppercase italic">ACCÈS VIP AVIATOR</h3>
                    <p className="text-gray-400 text-sm font-medium mb-8">Activez vos tokens pour recevoir les signaux en temps réel.</p>
                    <button 
                      onClick={() => window.open('https://t.me/vital_admin', '_blank')}
                      className="bg-red-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-600/20 flex items-center gap-2"
                    >
                      ACTIVER MAINTENANT <ShoppingCart size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="p-0">
                    {/* Aviator Logic */}
                    {activeNav === 'TIPS' && (
                      <div className="p-4 space-y-4">
                        <div className="bg-gradient-to-br from-red-600 to-red-900 p-6 rounded-3xl text-white relative overflow-hidden">
                          <Plane className="absolute -right-4 -bottom-4 text-white/10 rotate-12" size={140} />
                          <h3 className="text-2xl font-black italic mb-1">AVIATOR TIPS</h3>
                          <p className="text-xs font-bold text-red-200 uppercase tracking-widest">Signaux haute fidélité</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          {Array.from({ length: 8 }).map((_, i) => {
                            const time = new Date();
                            time.setMinutes(time.getMinutes() + (i + 1) * 2);
                            const mult = (1.2 + Math.random() * 8).toFixed(2);
                            const isHigh = parseFloat(mult) > 3;
                            return (
                              <div key={i} className="flex items-center justify-between p-4 bg-[#0B0C1A] rounded-2xl border border-gray-800">
                                <div className="flex items-center gap-4">
                                  <div className="text-lg font-black text-white italic">{formatTime(time)}</div>
                                  <div className="h-8 w-px bg-gray-800" />
                                  <div className={cn("text-xl font-black italic", isHigh ? "text-purple-500" : "text-blue-400")}>{mult}x</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={cn("text-[9px] font-black px-2 py-1 rounded uppercase", isHigh ? "bg-purple-500/20 text-purple-500" : "bg-blue-500/20 text-blue-400")}>
                                    {isHigh ? 'High Multi' : 'Safe Bet'}
                                  </span>
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(`${formatTime(time)} -> ${mult}x`);
                                      alert('Copié !');
                                    }}
                                    className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white"
                                  >
                                    <Copy size={16} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {activeNav === 'LIVE' && (
                      <div className="p-4 space-y-4">
                        <div className="bg-[#0B0C1A] rounded-3xl p-6 border border-gray-800">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                              <span className="text-xs font-black text-red-500 uppercase italic">Live Signals</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Algorithme v4.0</span>
                          </div>
                          
                          <div className="space-y-4">
                            {aviatorSignals.map((signal, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-[#1A1B2E] rounded-2xl border border-gray-800">
                                <div className="flex items-center gap-4">
                                  <div className="text-lg font-black text-white italic">{formatTime(signal.time)}</div>
                                  <div className="h-8 w-px bg-gray-800" />
                                  <div className="text-xl font-black text-[#FFC107] italic">{signal.mult}x</div>
                                </div>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${formatTime(signal.time)} -> ${signal.mult}x`);
                                    alert('Copié !');
                                  }}
                                  className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white"
                                >
                                  <Copy size={18} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeNav === 'HISTORY' && (
                      <div className="p-4 space-y-4">
                        <h3 className="font-black text-white italic uppercase tracking-wider">Derniers Vols</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {Array.from({ length: 12 }).map((_, i) => {
                            const mult = (1.0 + Math.random() * 15).toFixed(2);
                            const val = parseFloat(mult);
                            return (
                              <div key={i} className="bg-[#0B0C1A] p-3 rounded-xl border border-gray-800 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-500">{formatTime(new Date(Date.now() - (i + 1) * 60000))}</span>
                                <span className={cn(
                                  "font-black italic",
                                  val > 10 ? "text-pink-500" : val > 2 ? "text-purple-500" : "text-blue-400"
                                )}>{mult}x</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {activeNav === 'ANALYSE' && (
                      <div className="p-4 space-y-6">
                        <div className="bg-red-600 p-6 rounded-3xl text-white">
                          <h3 className="text-xl font-black italic mb-2">ALGO ANALYZER</h3>
                          <p className="text-xs text-red-200 font-bold uppercase tracking-widest">Calculateur de probabilités</p>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5 ml-1">Heure du tour</label>
                              <input 
                                type="text"
                                value={aviatorInputTime}
                                onChange={(e) => setAviatorInputTime(e.target.value)}
                                placeholder="12:00"
                                className="w-full bg-[#0B0C1A] border border-gray-800 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-red-600"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5 ml-1">Multiplicateur</label>
                              <input 
                                type="text"
                                value={aviatorInputRound}
                                onChange={(e) => setAviatorInputRound(e.target.value)}
                                placeholder="2.45x"
                                className="w-full bg-[#0B0C1A] border border-gray-800 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-red-600"
                              />
                            </div>
                          </div>
                          <button 
                            onClick={handleAviatorAnalysis}
                            disabled={isAnalyzingAviator}
                            className={cn(
                              "w-full text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all",
                              isAnalyzingAviator ? "bg-gray-700 cursor-not-allowed" : "bg-red-600 shadow-red-600/20 hover:bg-red-700"
                            )}
                          >
                            {isAnalyzingAviator ? (
                              <>ANALYSE EN COURS... <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></>
                            ) : (
                              <>LANCER L'ANALYSE <BarChart2 size={18} /></>
                            )}
                          </button>

                          {aviatorAnalysisResult && !isAnalyzingAviator && (
                            <div className="bg-[#0B0C1A] border-2 border-red-600 rounded-3xl p-6 animate-in zoom-in-95 duration-300">
                              <h4 className="text-white font-black italic text-center mb-4 uppercase">FIXED Future Rounds</h4>
                              <div className="space-y-3">
                                {aviatorAnalysisResult.map((signal, i) => (
                                  <div key={i} className="flex items-center justify-between p-3 bg-[#1A1B2E] rounded-xl border border-gray-800">
                                    <div className="text-sm font-black text-white italic">{signal.time}</div>
                                    <div className="text-lg font-black text-red-500 italic">{signal.mult}x</div>
                                    <span className="text-[9px] font-black bg-red-600/20 text-red-500 px-2 py-1 rounded uppercase">CONFIRMED</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeNav === 'BEST' && (
                      <div className="p-4 space-y-4">
                        <div className="bg-[#0B0C1A] p-6 rounded-3xl border border-purple-500/30">
                          <h3 className="text-xl font-black text-purple-500 italic mb-2">PREMIUM SIGNALS</h3>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Multiplicateurs 10x+ détectés</p>
                        </div>
                        
                        <div className="space-y-3">
                          {Array.from({ length: 3 }).map((_, i) => {
                            const time = new Date();
                            time.setMinutes(time.getMinutes() + (i + 1) * 15);
                            const mult = (10 + Math.random() * 50).toFixed(2);
                            return (
                              <div key={i} className="bg-gradient-to-r from-[#0B0C1A] to-[#1A1B2E] p-6 rounded-2xl border border-purple-500/20 flex justify-between items-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2">
                                  <Star size={40} className="text-purple-500/10" fill="currentColor" />
                                </div>
                                <div className="relative z-10">
                                  <div className="text-xs font-bold text-gray-500 uppercase mb-1">Heure estimée</div>
                                  <div className="text-2xl font-black text-white italic">{formatTime(time)}</div>
                                </div>
                                <div className="relative z-10 text-right">
                                  <div className="text-xs font-bold text-purple-500 uppercase mb-1">Cible</div>
                                  <div className="text-3xl font-black text-purple-500 italic">{mult}x</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {activeNav === 'VIP' && (
                      <div className="p-4 space-y-4">
                        <div className="bg-[#0B0C1A] p-8 rounded-3xl border-2 border-red-600 text-center">
                          <Diamond className="text-red-600 mx-auto mb-4" size={48} />
                          <h3 className="text-2xl font-black text-white italic mb-2">ESPACE VIP AVIATOR</h3>
                          <p className="text-gray-400 text-sm font-medium">Accédez aux prédictions de l'intelligence artificielle pour les 60 prochaines minutes.</p>
                        </div>
                        
                        <div className="bg-red-600/10 border border-red-600/20 p-4 rounded-2xl">
                          <div className="flex items-center gap-2 text-red-500 font-black text-xs uppercase mb-4">
                            <ShieldCheck size={14} /> Sécurisé par Algorithme V4
                          </div>
                          <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <div key={i} className="flex justify-between items-center py-2 border-b border-red-600/10 last:border-0">
                                <span className="text-sm font-bold text-white">{formatTime(new Date(Date.now() + (i + 1) * 10 * 60000))}</span>
                                <span className="text-sm font-black text-red-500 italic">PROBABILITÉ HAUTE</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeNav === 'ADMIN' && (
                      <div className="p-4 space-y-4">
                        <div className="bg-gray-900 p-6 rounded-3xl text-white">
                          <h3 className="text-xl font-black italic mb-2">ADMIN AVIATOR</h3>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Configuration des paramètres</p>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-[#0B0C1A] p-4 rounded-2xl border border-gray-800">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-3">Mode de Calcul</div>
                            <div className="flex gap-2">
                              <button className="flex-1 py-2 bg-red-600 text-white text-[10px] font-black rounded-lg">AGRESSIF</button>
                              <button className="flex-1 py-2 bg-gray-800 text-gray-400 text-[10px] font-black rounded-lg">PRUDENT</button>
                            </div>
                          </div>
                          <div className="bg-[#0B0C1A] p-4 rounded-2xl border border-gray-800">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-3">Fréquence des Signaux</div>
                            <input type="range" className="w-full accent-red-600" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="flex justify-between items-center px-1 py-2 bg-[#1A1B2E] border-t border-gray-800 overflow-x-auto no-scrollbar">
        {(currentView === 'AVIATOR_STUDIO' ? aviatorNavItems : navItems).map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'ADMIN_NAV') {
                const code = prompt("Code Admin:");
                if (code === "@9729") {
                  setShowAdminPanel(true);
                }
                return;
              }
              setActiveNav(item.id);
              if (item.id === 'MORE') setShowMoreModal(true);
            }}
            className={cn(
              "flex flex-col items-center justify-center min-w-[56px] h-12 rounded-lg",
              activeNav === item.id ? "text-[#FFC107]" : "text-gray-400"
            )}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-[8px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0B1B3D] rounded-3xl overflow-hidden shadow-2xl border border-gray-700 flex flex-col max-h-[90vh]">
            <div className="bg-[#1A1B2E] p-6 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white italic uppercase">ADMIN PANEL</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Gestion des utilisateurs</p>
              </div>
              <button 
                onClick={() => setShowAdminPanel(false)}
                className="p-2 bg-gray-800 rounded-xl text-gray-400 hover:text-white"
              >
                <MoreHorizontal size={24} />
              </button>
            </div>

            <div className="p-4 bg-[#0B0C1A]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text"
                  placeholder="Rechercher par numéro..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full bg-[#1A1B2E] border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white font-bold focus:outline-none focus:border-[#FFC107]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredUsers.map((u) => (
                <div key={u.id} className="bg-[#1A1B2E] p-4 rounded-2xl border border-gray-800 hover:border-[#FFC107] transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-[10px] font-black text-[#FFC107] uppercase mb-1">ID: {u.id}</div>
                      <div className="text-lg font-black text-white">{u.phone}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-gray-500 uppercase">Tokens</div>
                      <div className="text-lg font-black text-white">{u.tokens}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className={cn(
                      "text-[9px] font-black px-2 py-1 rounded uppercase",
                      isTokenActive(u) ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                    )}>
                      {isTokenActive(u) ? 'ACTIF' : 'INACTIF'}
                    </span>
                    <div className="flex-1 flex gap-2">
                      <input 
                        type="number"
                        placeholder="Tokens"
                        value={tokenAmountToAdd[u.id] || ''}
                        onChange={(e) => setTokenAmountToAdd(prev => ({ ...prev, [u.id]: e.target.value }))}
                        className="flex-1 bg-[#0B0C1A] border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#FFC107]"
                      />
                      <button 
                        onClick={() => {
                          const amount = parseInt(tokenAmountToAdd[u.id] || '0');
                          if (amount > 0) {
                            handleAddTokens(u.id, amount);
                            setTokenAmountToAdd(prev => ({ ...prev, [u.id]: '' }));
                          } else {
                            alert('Veuillez entrer un montant valide');
                          }
                        }}
                        className="bg-[#FFC107] text-black text-[10px] font-black px-4 py-2 rounded-lg hover:scale-105 transition-transform uppercase"
                      >
                        ENVOYER
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
              {/* Payment Section */}
              <div className="bg-gradient-to-r from-[#FFC107] to-[#ffb300] p-4 rounded-xl shadow-lg mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard size={20} className="text-black" />
                    <h3 className="text-black font-black uppercase tracking-wider">Activer vos Tokens</h3>
                  </div>
                  <span className="bg-black/10 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">VIP ACCESS</span>
                </div>
                <p className="text-black/70 text-xs font-medium mb-4">Accédez à tous les pronostics VIP, LIVE et AVIATOR en activant vos tokens.</p>
                <button 
                  onClick={() => {
                    alert("Numéro copié: 0342594678\nEnvoyez votre ID: " + currentUser?.id);
                  }}
                  className="w-full bg-black text-white font-black py-3 rounded-lg flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                >
                  <CreditCard size={18} /> PAYER (034 25 946 78)
                </button>
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
  );
}
