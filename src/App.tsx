import React, { useState, useMemo, useEffect } from 'react';
import { Menu, ShoppingCart, Star, ChevronRight, Clock, Flame, Trophy, TrendingUp, PlayCircle, Diamond, ArrowRightLeft, MoreHorizontal, CheckCircle, BarChart2, Lock, User, Copy, LogOut } from 'lucide-react';
import { analyzeMatch } from './lib/predictionEngine';
import { cn } from './lib/utils';
import { leagues, teamsByLeague } from './lib/mockData';
import { useVirtualLeague } from './lib/virtualLeague';
import { Auth } from './components/Auth';
import { Admin } from './components/Admin';
import { Intro } from './components/Intro';
import { Conditions } from './components/Conditions';
import { HomeMenu } from './components/HomeMenu';
import { AviatorStudio } from './components/AviatorStudio';
import { ManualAnalysis } from './components/ManualAnalysis';
import { NotificationContainer, NotificationType } from './components/Notification';
import { fetchApi } from './lib/api';

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
                    <span className="text-gray-600">Yes (GG)</span>
                    <span className="font-bold text-green-600">{match.fullOdds.goals.btts.yes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">No (NG)</span>
                    <span className="font-bold text-red-600">{match.fullOdds.goals.btts.no.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Half Time */}
              <div className="grid grid-cols-2 gap-3">
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
                <div className="bg-white rounded-lg border p-3">
                  <div className="text-xs font-bold text-gray-500 mb-2 uppercase">HT Double Chance</div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">1X</span>
                    <span className="font-bold">{match.fullOdds.halfTime.doubleChance['1X'].toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">12</span>
                    <span className="font-bold">{match.fullOdds.halfTime.doubleChance['12'].toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">X2</span>
                    <span className="font-bold">{match.fullOdds.halfTime.doubleChance['X2'].toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* HT/FT */}
              <div className="bg-white rounded-lg border p-3">
                <div className="text-xs font-bold text-gray-500 mb-2 uppercase">Half Time / Full Time</div>
                <div className="grid grid-cols-3 gap-2 text-sm text-center">
                  <div><span className="text-gray-500 text-xs block">1/1</span><span className="font-bold">{match.fullOdds.main.htft['1/1'].toFixed(2)}</span></div>
                  <div><span className="text-gray-500 text-xs block">1/X</span><span className="font-bold">{match.fullOdds.main.htft['1/X'].toFixed(2)}</span></div>
                  <div><span className="text-gray-500 text-xs block">1/2</span><span className="font-bold">{match.fullOdds.main.htft['1/2'].toFixed(2)}</span></div>
                  <div><span className="text-gray-500 text-xs block">X/1</span><span className="font-bold">{match.fullOdds.main.htft['X/1'].toFixed(2)}</span></div>
                  <div><span className="text-gray-500 text-xs block">X/X</span><span className="font-bold">{match.fullOdds.main.htft['X/X'].toFixed(2)}</span></div>
                  <div><span className="text-gray-500 text-xs block">X/2</span><span className="font-bold">{match.fullOdds.main.htft['X/2'].toFixed(2)}</span></div>
                  <div><span className="text-gray-500 text-xs block">2/1</span><span className="font-bold">{match.fullOdds.main.htft['2/1'].toFixed(2)}</span></div>
                  <div><span className="text-gray-500 text-xs block">2/X</span><span className="font-bold">{match.fullOdds.main.htft['2/X'].toFixed(2)}</span></div>
                  <div><span className="text-gray-500 text-xs block">2/2</span><span className="font-bold">{match.fullOdds.main.htft['2/2'].toFixed(2)}</span></div>
                </div>
              </div>

              {/* Correct Score */}
              <div className="bg-white rounded-lg border p-3">
                <div className="text-xs font-bold text-gray-500 mb-2 uppercase">Correct Score</div>
                <div className="grid grid-cols-3 gap-2 text-sm text-center">
                  {Object.entries(match.fullOdds.main.exactScore).map(([score, odds]: [string, any]) => (
                    <div key={score}><span className="text-gray-500 text-xs block">{score}</span><span className="font-bold">{odds.toFixed(2)}</span></div>
                  ))}
                </div>
              </div>

              {/* HT Correct Score */}
              <div className="bg-white rounded-lg border p-3">
                <div className="text-xs font-bold text-gray-500 mb-2 uppercase">HT Correct Score</div>
                <div className="grid grid-cols-4 gap-2 text-sm text-center">
                  {Object.entries(match.fullOdds.halfTime.exactScore).map(([score, odds]: [string, any]) => (
                    <div key={score}><span className="text-gray-500 text-xs block">{score}</span><span className="font-bold">{odds.toFixed(2)}</span></div>
                  ))}
                </div>
              </div>

              {/* Team Totals */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg border p-3">
                  <div className="text-xs font-bold text-gray-500 mb-2 uppercase">Home Total Goals</div>
                  {Object.entries(match.fullOdds.teamTotals.home).map(([line, odds]: [string, any]) => (
                    <div key={line} className="flex justify-between text-sm border-b pb-1 mb-1 last:border-0 last:mb-0">
                      <span className="text-gray-600">O/U {line}</span>
                      <div className="flex gap-2">
                        <span className="font-bold text-green-600">{odds.over.toFixed(2)}</span>
                        <span className="font-bold text-red-600">{odds.under.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-lg border p-3">
                  <div className="text-xs font-bold text-gray-500 mb-2 uppercase">Away Total Goals</div>
                  {Object.entries(match.fullOdds.teamTotals.away).map(([line, odds]: [string, any]) => (
                    <div key={line} className="flex justify-between text-sm border-b pb-1 mb-1 last:border-0 last:mb-0">
                      <span className="text-gray-600">O/U {line}</span>
                      <div className="flex gap-2">
                        <span className="font-bold text-green-600">{odds.over.toFixed(2)}</span>
                        <span className="font-bold text-red-600">{odds.under.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Markets */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg border p-3">
                  <div className="text-xs font-bold text-gray-500 mb-2 uppercase">Odd / Even</div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Odd (Impair)</span>
                    <span className="font-bold">{match.fullOdds.special.oddEven.odd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Even (Pair)</span>
                    <span className="font-bold">{match.fullOdds.special.oddEven.even.toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg border p-3">
                  <div className="text-xs font-bold text-gray-500 mb-2 uppercase">First Team To Score</div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Home</span>
                    <span className="font-bold">{match.fullOdds.goals.ftts.home.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Away</span>
                    <span className="font-bold">{match.fullOdds.goals.ftts.away.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">None</span>
                    <span className="font-bold">{match.fullOdds.goals.ftts.none.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Multi Goals & First Goal Minute */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg border p-3">
                  <div className="text-xs font-bold text-gray-500 mb-2 uppercase">Multi Goals</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(match.fullOdds.special.multiGoals).map(([range, odds]: [string, any]) => (
                      <div key={range} className="flex justify-between">
                        <span className="text-gray-600">{range}</span>
                        <span className="font-bold">{odds.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-lg border p-3">
                  <div className="text-xs font-bold text-gray-500 mb-2 uppercase">First Goal Minute</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(match.fullOdds.special.firstGoalMinute).map(([range, odds]: [string, any]) => (
                      <div key={range} className="flex justify-between">
                        <span className="text-gray-600">{range}</span>
                        <span className="font-bold">{odds.toFixed(2)}</span>
                      </div>
                    ))}
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
  const [showIntro, setShowIntro] = useState(true);
  const [showConditions, setShowConditions] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [activeNav, setActiveNav] = useState('HOME');
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(1); // Default to today (index 1)
  const [notifications, setNotifications] = useState<{id: string, message: string, type: NotificationType, duration?: number}[]>([]);

  const addNotification = (message: string, type: NotificationType, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, message, type, duration }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('10000');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCode, setAdminCode] = useState('');

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (user && user.status === 'ACTIVE') {
      const expireDate = new Date(user.expire_date);
      const now = new Date();
      if (expireDate > now) {
        const diffTime = expireDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays <= 3) {
          addNotification(`Votre abonnement VIP expire dans ${diffDays} jour(s).`, 'warning', 10000);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Check if admin token
          const decoded = JSON.parse(atob(token.split('.')[1]));
          if (decoded.admin) {
            setIsAdmin(true);
          } else {
            const data = await fetchApi('/auth/me');
            setUser(data.user);
          }
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCode === '@9729') {
      handleAdminLogin(adminCode);
      setShowAdminLogin(false);
      setAdminCode('');
    } else {
      addNotification('Code invalide', 'warning');
    }
  };

  const handleAdminLogin = async (code: string) => {
    try {
      const data = await fetchApi('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ code })
      });
      localStorage.setItem('token', data.token);
      setIsAdmin(true);
    } catch (err) {
      addNotification('Code invalide', 'warning');
    }
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentRef) return;
    try {
      await fetchApi('/payments', {
        method: 'POST',
        body: JSON.stringify({ reference: paymentRef, amount: parseInt(paymentAmount) })
      });
      setPaymentStatus('Paiement envoyé ! En attente de validation.');
      setPaymentRef('');
      setTimeout(() => {
        setShowPayment(false);
        setPaymentStatus('');
      }, 3000);
    } catch (err) {
      addNotification('Erreur lors de l\'envoi du paiement', 'warning');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAdmin(false);
  };

  const leagueStates = useVirtualLeague();

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
  const allNavItems = [ 
    { id: 'TIPS', icon: <Flame size={20} />, label: 'TIPS' }, 
    { id: 'MULTIPLE', icon: <Trophy size={20} />, label: 'MULTIPLE' }, 
    { id: 'BEST', icon: <TrendingUp size={20} />, label: 'BEST' }, 
    { id: 'LIVE', icon: <PlayCircle size={20} />, label: 'LIVE' }, 
    { id: 'VIP', icon: <Diamond size={20} />, label: 'VIP' }, 
    { id: 'RESULTS', icon: <CheckCircle size={20} />, label: 'RESULTS' }, 
    { id: 'STATS', icon: <BarChart2 size={20} />, label: 'STATS' } 
  ];

  const isVipActive = user?.status === 'ACTIVE';
  const navItems = isVipActive 
    ? allNavItems 
    : allNavItems.filter(item => ['RESULTS', 'STATS'].includes(item.id));

  // Ensure activeNav is valid
  useEffect(() => {
    if (!isVipActive && !['RESULTS', 'STATS', 'HOME', 'AVIATOR', 'ANALYSE'].includes(activeNav)) {
      setActiveNav('HOME');
    }
  }, [isVipActive, activeNav]);

  const lastNotifiedSlot = React.useRef<number | null>(null);

  useEffect(() => {
    if (activeNav === 'TIPS' && isVipActive) {
      const currentSlotTimeMs = leagueStates[0]?.currentSlotTime?.getTime();
      if (currentSlotTimeMs && currentSlotTimeMs !== lastNotifiedSlot.current) {
        const hasHotMatch = leagueStates.some(league => 
          league.slots.some(slot => 
            slot.time.getTime() === currentSlotTimeMs && slot.matches.some(m => m.isHotMatch)
          )
        );
        if (hasHotMatch) {
          addNotification('🔥 HOT MATCH détecté dans le cycle actuel !', 'info', 5000);
          lastNotifiedSlot.current = currentSlotTimeMs;
        }
      }
    }
  }, [activeNav, isVipActive, leagueStates[0]?.currentSlotTime]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (showIntro) {
    return <Intro onComplete={() => {
      setShowIntro(false);
      if (!localStorage.getItem('conditionsAccepted')) {
        setShowConditions(true);
      }
    }} />;
  }

  if (showConditions) {
    return <Conditions onAccept={() => {
      localStorage.setItem('conditionsAccepted', 'true');
      setShowConditions(false);
    }} />;
  }

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-[#1A1B2E] flex items-center justify-center text-white">Chargement...</div>;
  }

  if (isAdmin) {
    return <Admin onLogout={logout} />;
  }

  if (!user) {
    return <Auth onLogin={setUser} onAdminLogin={handleAdminLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#1A1B2E] text-white font-sans overflow-hidden">
      <NotificationContainer notifications={notifications} onClose={removeNotification} />
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#1A1B2E] border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button className="p-2 bg-[#2A3A5B] rounded-xl text-white hover:bg-[#FFC107] hover:text-black transition-colors">
              <Menu size={24} />
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1B2E] border border-gray-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
              <button onClick={() => setActiveNav('TIPS')} className="w-full text-left px-4 py-3 text-sm font-bold text-white hover:bg-[#2A3A5B] flex items-center gap-2">
                <Trophy size={16} className="text-[#45F3FF]" /> VIRTUEL FOOT
              </button>
              <button onClick={() => setActiveNav('AVIATOR')} className="w-full text-left px-4 py-3 text-sm font-bold text-white hover:bg-[#2A3A5B] flex items-center gap-2">
                <PlayCircle size={16} className="text-[#FF003C]" /> AVIATOR
              </button>
              <a href="tel:0342594678" className="w-full text-left px-4 py-3 text-sm font-bold text-white hover:bg-[#2A3A5B] flex items-center gap-2">
                <User size={16} className="text-[#FFC107]" /> CONTACT ADMIN
              </a>
              <button 
                onDoubleClick={() => setShowAdminLogin(true)}
                className="w-full text-left px-4 py-3 text-xs font-mono text-gray-600 hover:bg-[#2A3A5B] hover:text-gray-400"
              >
                ADMIN ACCESS
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#45F3FF] to-[#FF003C] tracking-tight">VITAL PRONOSTIC</h1>
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Betting Tips</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPayment(true)} className="p-2 bg-[#FFC107] rounded-xl text-black hover:bg-[#ffb300] transition-colors relative">
            <ShoppingCart size={20} />
            {user.token_balance > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white">
                {user.token_balance}
              </span>
            )}
          </button>
          <button onClick={logout} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* VIP Status Banner */}
      <div className={cn("px-4 py-2 text-xs font-bold shadow-md z-10 flex justify-between items-center", isVipActive ? "bg-gradient-to-r from-green-600 to-green-500 text-white" : "bg-gradient-to-r from-red-600 to-red-500 text-white")}>
        <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-lg">
          <span className="font-mono">ID: {user.id}</span>
        </div>
        
        {isVipActive ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <CheckCircle size={14} />
              <span>Tokens: ACTIVE</span>
            </div>
            <span className="bg-black/20 px-2 py-0.5 rounded-full text-[10px]">
              Expire: {new Date(user.expire_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        ) : (
          <button onClick={() => setShowPayment(true)} className="flex items-center gap-2 bg-white text-red-600 px-3 py-1 rounded-full hover:bg-gray-100 transition-colors">
            <Lock size={14} />
            <span>Activez votre token pour accéder aux signaux</span>
          </button>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1B2E] rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_30px_rgba(69,243,255,0.2)] border border-gray-800">
            <div className="bg-gradient-to-r from-[#2A3A5B] to-[#1A1B2E] p-4 text-center relative border-b border-gray-800">
              <h2 className="text-xl font-black text-white">ACTIVER LE VIP</h2>
              <button onClick={() => setShowPayment(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">✕</button>
            </div>
            <div className="p-6 text-gray-300">
              <div className="bg-[#0B0C10] border border-[#45F3FF]/30 rounded-xl p-4 mb-6 text-center">
                <p className="text-sm text-gray-400 font-bold mb-1">Envoyez le paiement au numéro :</p>
                <a href="tel:0342594678" className="text-3xl font-black text-[#45F3FF] tracking-wider hover:text-white transition-colors block my-2">034 25 946 78</a>
                <p className="text-xs text-gray-500 mt-1">(Telma / Airtel)</p>
              </div>

              <form onSubmit={submitPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Montant envoyé</label>
                  <select 
                    value={paymentAmount} 
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#0B0C10] text-white focus:border-[#45F3FF] focus:ring-1 focus:ring-[#45F3FF] outline-none font-bold appearance-none"
                  >
                    <option value="5000">5 000 Ar (Durée personnalisée)</option>
                    <option value="10000">10 000 Ar (7 Jours)</option>
                    <option value="40000">40 000 Ar (30 Jours)</option>
                    <option value="400000">400 000 Ar (1 An)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Référence de transaction</label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-[#0B0C10] text-white focus:border-[#45F3FF] focus:ring-1 focus:ring-[#45F3FF] outline-none font-medium placeholder-gray-600"
                    placeholder="Ex: 123456789"
                    required
                  />
                </div>
                
                {paymentStatus && (
                  <div className="p-4 bg-green-500/10 text-green-400 text-sm font-bold rounded-xl text-center border border-green-500/30">
                    {paymentStatus}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#FFC107] hover:bg-[#ffb300] text-[#1A1B2E] font-black py-4 rounded-xl shadow-[0_0_15px_rgba(255,193,7,0.3)] transition-all mt-6"
                >
                  CONFIRMER LE PAIEMENT
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {activeNav === 'HOME' ? (
        <HomeMenu onSelect={(nav) => setActiveNav(nav === 'VIRTUEL_FOOT' ? 'TIPS' : nav)} />
      ) : activeNav === 'AVIATOR' ? (
        <AviatorStudio isVipActive={isVipActive} onShowPayment={() => setShowPayment(true)} />
      ) : activeNav === 'ANALYSE' ? (
        <ManualAnalysis isVipActive={isVipActive} onShowPayment={() => setShowPayment(true)} />
      ) : (
        <>
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

          {/* Match List */}
          <div className="flex-1 overflow-y-auto bg-white text-black">
            {(() => {
              if (leagueStates.length === 0) return null;
              
              if (activeNav === 'RESULTS' || selectedDateIndex === 0) {
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
                {leagueState.isBreak && (
                  <div className="p-8 text-center bg-gray-50 border-y border-gray-200">
                    <div className="text-4xl mb-3">☕</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Pause Technique</h3>
                    <p className="text-gray-500 text-sm">
                      Prochain cycle dans {Math.ceil(leagueState.breakTimeRemaining / 60000)} minutes
                    </p>
                  </div>
                )}
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
      </>
      )}

      {/* Bottom Navigation */}
      {activeNav !== 'AVIATOR' && activeNav !== 'HOME' && (
        <div className="flex justify-between items-center px-2 py-2 bg-[#1A1B2E] border-t border-gray-800">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveNav(item.id);
                if (item.id === 'MORE') setShowMoreModal(true);
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

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1B2E] border border-gray-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <Lock size={20} className="text-[#FF003C]" /> Accès Administrateur
              </h3>
              <form onSubmit={handleAdminLoginSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-400 mb-1">Code Secret</label>
                  <input 
                    type="password" 
                    value={adminCode} 
                    onChange={e => setAdminCode(e.target.value)}
                    className="w-full bg-[#0F101A] border border-gray-800 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-[#45F3FF]"
                    placeholder="••••"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => { setShowAdminLogin(false); setAdminCode(''); }}
                    className="flex-1 py-3 bg-[#2A3A5B] hover:bg-[#3A4A6B] text-white rounded-xl font-bold transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-[#FF003C] hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-[#FF003C]/30"
                  >
                    Connexion
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
