import React, { useState, useMemo } from 'react';
import { Menu, ShoppingCart, Star, ChevronRight, Clock, Flame, Trophy, TrendingUp, PlayCircle, Diamond, ArrowRightLeft, MoreHorizontal } from 'lucide-react';
import { analyzeMatch } from './lib/predictionEngine';
import { cn } from './lib/utils';
import { leagues } from './lib/mockData';
import { useVirtualLeague } from './lib/virtualLeague';

const TeamLogo = ({ team }: { team: { name: string, logo?: string } }) => {
  if (team.logo) {
    return <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />;
  }
  const initials = team.name.substring(0, 2).toUpperCase();
  return (
    <div className="w-5 h-5 rounded-full bg-[#2A3A5B] text-white flex items-center justify-center text-[9px] font-bold shadow-sm">
      {initials}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('Tous');
  const [activeNav, setActiveNav] = useState('TIPS');
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

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

  const dates = [
    { day: 'Fri', date: 'Mar 13' },
    { day: 'Sat', date: 'Mar 14' },
    { day: 'Sun', date: 'Mar 15' },
    { day: 'Mon', date: 'Mar 16' },
    { day: 'Tue', date: 'Mar 17' },
  ];

  const tabs = ['Tous', 'Populaire', 'Favoris'];
  const navItems = [ { id: 'TIPS', icon: <Flame size={20} />, label: 'TIPS' }, { id: 'FREE', icon: <Trophy size={20} />, label: 'FREE' }, { id: 'BEST', icon: <TrendingUp size={20} />, label: 'BEST' }, { id: 'LIVE', icon: <PlayCircle size={20} />, label: 'LIVE' }, { id: 'VIP', icon: <Diamond size={20} />, label: 'VIP' }, { id: 'HT-FT', icon: <ArrowRightLeft size={20} />, label: 'HT-FT' }, { id: 'MORE', icon: <MoreHorizontal size={20} />, label: 'MORE' } ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-[#1A1B2E] text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#1A1B2E]">
        <button className="p-2 bg-[#FFC107] rounded-md text-black">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-blue-200">Betting Tips</h1>
        <div className="relative">
          <button className="p-2 bg-[#FFC107] rounded-md text-black">
            <ShoppingCart size={24} />
          </button>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            1
          </span>
        </div>
      </header>

      {/* Date Selector */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar bg-[#1A1B2E]">
        {dates.map((d, i) => (
          <button
            key={i}
            className={cn(
              "flex flex-col items-center justify-center min-w-[70px] py-2 rounded-md text-sm",
              i === 0 ? "bg-[#2A2B4A] text-white" : "bg-[#2A2B4A]/50 text-gray-400"
            )}
          >
            <span className="font-medium">{d.day}</span>
            <span className="text-xs">{d.date}</span>
          </button>
        ))}
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
          
          const firstLeague = leagueStates[0];
          const displayedSlots = activeNav === 'LIVE' 
            ? firstLeague.slots.filter(s => firstLeague.currentSlotTime && s.time.getTime() === firstLeague.currentSlotTime.getTime())
            : firstLeague.slots;

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

          return displayedSlots.map((slot) => (
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

              {leagueStates.map(leagueState => {
                const leagueSlot = leagueState.slots.find(s => s.time.getTime() === slot.time.getTime());
                if (!leagueSlot || leagueSlot.matches.length === 0) return null;

                return (
                  <div key={`${leagueState.leagueId}-${slot.time.toISOString()}`} className="mb-4">
                    <div className="bg-[#2A3A5B] text-blue-100 px-4 py-1.5 font-bold text-sm sticky top-14 z-10 flex items-center gap-2 border-b border-[#1A1B2E]/20">
                      <span>{leagueState.leagueLogo || '🏆'}</span> {leagueState.leagueName}
                    </div>
                    
                    {leagueSlot.matches.map((match) => {
                      const prediction = analyzeMatch(match);
                      const isExpanded = selectedMatch === match.id;
                      
                      return (
                        <div key={match.id} className="border-b border-gray-200">
                          <div 
                            className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setSelectedMatch(isExpanded ? null : match.id)}
                          >
                            <div className="w-16 flex flex-col items-center justify-center">
                              <span className={cn(
                                "text-xs font-bold px-2 py-0.5 rounded",
                                match.status === 'LIVE' ? "bg-red-100 text-red-600 animate-pulse" :
                                match.status === 'FT' ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"
                              )}>{match.status}</span>
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
                            </div>
                            
                            <div className="flex flex-col items-end gap-1 ml-2">
                              <div className="flex gap-1">
                                <div className="flex flex-col items-center">
                                  <span className="text-[10px] text-gray-500 font-medium">1</span>
                                  <span className={cn("px-2 py-1 text-xs border rounded font-bold", prediction.matchCible.bestPrediction === '1' ? "bg-green-50 border-green-500 text-green-700" : "border-gray-200 text-gray-700 bg-white")}>
                                    {match.odds.home.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <span className="text-[10px] text-gray-500 font-medium">X</span>
                                  <span className={cn("px-2 py-1 text-xs border rounded font-bold", prediction.matchCible.bestPrediction === 'X' ? "bg-green-50 border-green-500 text-green-700" : "border-gray-200 text-gray-700 bg-white")}>
                                    {match.odds.draw.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <span className="text-[10px] text-gray-500 font-medium">2</span>
                                  <span className={cn("px-2 py-1 text-xs border rounded font-bold", prediction.matchCible.bestPrediction === '2' ? "bg-green-50 border-green-500 text-green-700" : "border-gray-200 text-gray-700 bg-white")}>
                                    {match.odds.away.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="bg-gray-50 px-4 py-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
                              <div className="grid grid-cols-2 gap-4">
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
                    })}
                  </div>
                );
              })}
            </div>
          ));
        })()}
      </div>

      {/* Bottom Navigation */}
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
    </div>
  );
}
