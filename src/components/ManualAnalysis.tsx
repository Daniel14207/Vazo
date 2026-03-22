import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Trash2, Activity, Star, BarChart2 } from 'lucide-react';
import { leagues, teamsByLeague } from '../lib/mockData';
import { analyzeMatch, generateFullOdds } from '../lib/predictionEngine';

export const ManualAnalysis = ({ isVipActive, onShowPayment }: { isVipActive: boolean, onShowPayment: () => void }) => {
  const [history, setHistory] = useState<{ id: string, home: string, away: string, scoreHome: string, scoreAway: string }[]>([]);
  const [newMatches, setNewMatches] = useState<{ id: string, home: string, away: string, oddsHome: string, oddsDraw: string, oddsAway: string, time: string }[]>([]);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  if (!isVipActive) {
    return (
      <div className="p-6 text-center bg-white rounded-xl shadow-sm m-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="text-red-500" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Accès VIP Requis</h2>
        <p className="text-gray-600 mb-6">L'outil d'analyse manuelle est réservé aux membres VIP.</p>
        <button 
          onClick={onShowPayment}
          className="w-full bg-[#FFC107] text-black font-bold py-3 rounded-lg shadow-md"
        >
          Activer mon VIP
        </button>
      </div>
    );
  }

  const addHistoryRow = () => {
    setHistory([...history, { id: Math.random().toString(), home: '', away: '', scoreHome: '', scoreAway: '' }]);
  };

  const removeHistoryRow = (id: string) => {
    setHistory(history.filter(h => h.id !== id));
  };

  const updateHistory = (id: string, field: string, value: string) => {
    setHistory(history.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const addNewMatchRow = () => {
    setNewMatches([...newMatches, { id: Math.random().toString(), home: '', away: '', oddsHome: '', oddsDraw: '', oddsAway: '', time: '' }]);
  };

  const removeNewMatchRow = (id: string) => {
    setNewMatches(newMatches.filter(m => m.id !== id));
  };

  const updateNewMatch = (id: string, field: string, value: string) => {
    setNewMatches(newMatches.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleAnalyze = () => {
    if (newMatches.length === 0) return;
    
    setIsAnalyzing(true);
    
    setTimeout(() => {
      // Generate results for the first match as an example
      const match = newMatches[0];
      
      // Find team objects or create mock ones
      let homeTeamObj = null;
      let awayTeamObj = null;
      
      for (const leagueId of Object.keys(teamsByLeague)) {
        const teams = teamsByLeague[leagueId];
        if (!homeTeamObj) homeTeamObj = teams.find(t => t.name.toLowerCase() === match.home.toLowerCase());
        if (!awayTeamObj) awayTeamObj = teams.find(t => t.name.toLowerCase() === match.away.toLowerCase());
      }
      
      if (!homeTeamObj) homeTeamObj = { id: 'h1', name: match.home || 'Home Team', strength: 75, form: [1, 0, -1, 1, 1] };
      if (!awayTeamObj) awayTeamObj = { id: 'a1', name: match.away || 'Away Team', strength: 70, form: [-1, 0, 1, -1, 0] };
      
      const mockMatch = {
        id: 'manual-' + Date.now(),
        leagueId: 'manual',
        leagueName: 'Manual Analysis',
        country: 'World',
        homeTeam: homeTeamObj,
        awayTeam: awayTeamObj,
        date: new Date().toISOString(),
        status: 'NS' as const,
        odds: {
          home: parseFloat(match.oddsHome) || 2.0,
          draw: parseFloat(match.oddsDraw) || 3.0,
          away: parseFloat(match.oddsAway) || 3.5
        }
      };
      
      const prediction = analyzeMatch(mockMatch);
      const fullOdds = generateFullOdds(prediction.powerScores.home, prediction.powerScores.away, mockMatch.odds);

      
      setAnalysisResult({
        match,
        prediction,
        fullOdds
      });
      
      setIsAnalyzing(false);
    }, 5000);
  };

  if (analysisResult) {
    const { match, prediction, fullOdds } = analysisResult;
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <button 
          onClick={() => setAnalysisResult(null)}
          className="mb-4 text-sm font-bold text-blue-600 flex items-center gap-1"
        >
          ← Nouvelle Analyse
        </button>
        
        <div className="bg-gradient-to-br from-[#1A1B2E] to-[#0B0C10] rounded-2xl p-6 shadow-2xl border border-[#FFC107]/30 text-white">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Star className="text-[#FFC107]" fill="currentColor" size={24} />
            <h2 className="text-2xl font-black text-[#FFC107] uppercase tracking-widest">VIP RESULT</h2>
            <Star className="text-[#FFC107]" fill="currentColor" size={24} />
          </div>
          
          <div className="flex justify-between items-center mb-8 bg-white/5 p-4 rounded-xl">
            <div className="text-center flex-1">
              <div className="font-black text-xl">{match.home || 'Home Team'}</div>
              <div className="text-xs text-gray-400 mt-1">Cote: {match.oddsHome || '-'}</div>
            </div>
            <div className="px-4 text-center">
              <div className="text-sm text-gray-400 font-bold">{match.time || 'VS'}</div>
              <div className="text-xs text-gray-500 mt-1">Nul: {match.oddsDraw || '-'}</div>
            </div>
            <div className="text-center flex-1">
              <div className="font-black text-xl">{match.away || 'Away Team'}</div>
              <div className="text-xs text-gray-400 mt-1">Cote: {match.oddsAway || '-'}</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-xl border border-white/10">
              <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Pronostic Principal</div>
              <div className="text-2xl font-black text-[#45F3FF]">{prediction.matchCible.bestPrediction}</div>
              <div className="text-sm text-green-400 font-bold mt-1">Confiance: {prediction.matchCible.confidence}%</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Score Exact</div>
                <div className="text-xl font-black text-white">{prediction.matchCible.exactScore}</div>
                <div className="text-xs text-gray-400 mt-1">Alt: {prediction.vip.exactScoreAlt}</div>
              </div>
              <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Combo VIP</div>
                <div className="text-lg font-bold text-[#FFC107]">{prediction.vip.comboBet}</div>
              </div>
            </div>
            
            <div className="bg-white/10 p-4 rounded-xl border border-white/10">
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">Safe Bets</div>
              <div className="flex flex-wrap gap-2">
                {prediction.safeBets.over15 && <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">Over 1.5</span>}
                {prediction.safeBets.under45 && <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">Under 4.5</span>}
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">{prediction.safeBets.doubleChance}</span>
              </div>
            </div>
            
            <div className="bg-white/10 p-4 rounded-xl border border-white/10">
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">Analyse IA</div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Power Score</span>
                <span className="font-bold">{prediction.powerScores.home.toFixed(1)} - {prediction.powerScores.away.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Expected Goals (xG)</span>
                <span className="font-bold">{prediction.expectedGoals.home.toFixed(2)} - {prediction.expectedGoals.away.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Probabilité (1X2)</span>
                <span className="font-bold">{Math.round(prediction.winProbability.home * 100)}% / {Math.round(prediction.winProbability.draw * 100)}% / {Math.round(prediction.winProbability.away * 100)}%</span>
              </div>
            </div>

            {/* Full Betting Markets */}
            {fullOdds && (
              <div className="mt-6 pt-4 border-t border-white/10 space-y-4">
                <h3 className="text-[#FFC107] font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                  <BarChart2 size={16} /> Tous les pronostics
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <div className="text-[10px] text-gray-400 mb-2 uppercase font-bold">Double Chance</div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">1X</span><span className="font-bold">{fullOdds.main.doubleChance['1X'].toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">12</span><span className="font-bold">{fullOdds.main.doubleChance['12'].toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-500">X2</span><span className="font-bold">{fullOdds.main.doubleChance['X2'].toFixed(2)}</span></div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <div className="text-[10px] text-gray-400 mb-2 uppercase font-bold">Both Teams To Score</div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Yes (GG)</span><span className="font-bold text-green-400">{fullOdds.goals.btts.yes.toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-500">No (NG)</span><span className="font-bold text-red-400">{fullOdds.goals.btts.no.toFixed(2)}</span></div>
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="text-[10px] text-gray-400 mb-2 uppercase font-bold">Total Goals (Over/Under)</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(fullOdds.main.overUnder).map(([line, odds]: [string, any]) => (
                      <div key={line} className="flex justify-between text-xs border-b border-white/5 pb-1">
                        <span className="text-gray-500">O/U {line}</span>
                        <div className="flex gap-2">
                          <span className="font-bold text-green-400">{odds.over.toFixed(2)}</span>
                          <span className="font-bold text-red-400">{odds.under.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <div className="text-[10px] text-gray-400 mb-2 uppercase font-bold">Half Time (1X2)</div>
                    <div className="flex justify-between text-xs">
                      <div className="flex flex-col items-center"><span className="text-gray-500">1</span><span className="font-bold">{fullOdds.halfTime['1X2'].home.toFixed(2)}</span></div>
                      <div className="flex flex-col items-center"><span className="text-gray-500">X</span><span className="font-bold">{fullOdds.halfTime['1X2'].draw.toFixed(2)}</span></div>
                      <div className="flex flex-col items-center"><span className="text-gray-500">2</span><span className="font-bold">{fullOdds.halfTime['1X2'].away.toFixed(2)}</span></div>
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <div className="text-[10px] text-gray-400 mb-2 uppercase font-bold">HT Double Chance</div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">1X</span><span className="font-bold">{fullOdds.halfTime.doubleChance['1X'].toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">12</span><span className="font-bold">{fullOdds.halfTime.doubleChance['12'].toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-500">X2</span><span className="font-bold">{fullOdds.halfTime.doubleChance['X2'].toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#2A3A5B] uppercase tracking-tight flex items-center gap-2">
          <Activity className="text-[#45F3FF]" /> Analyse Manuelle
        </h2>
        <p className="text-gray-500 text-sm mt-1">Entrez les données historiques et les matchs à analyser.</p>
      </div>

      {/* Historique Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">1. Historique des matchs</h3>
          <button onClick={addHistoryRow} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1 px-3 rounded flex items-center gap-1">
            <Plus size={14} /> Ajouter
          </button>
        </div>
        
        {history.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm italic border-2 border-dashed border-gray-100 rounded-lg">
            Aucun historique ajouté. Cliquez sur "Ajouter" pour commencer.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((row, index) => (
              <div key={row.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                <span className="text-xs font-bold text-gray-400 w-4">{index + 1}.</span>
                <input 
                  type="text" 
                  placeholder="Équipe Domicile" 
                  className="flex-1 text-sm p-2 border rounded bg-white"
                  value={row.home}
                  onChange={(e) => updateHistory(row.id, 'home', e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="0" 
                  className="w-12 text-center text-sm p-2 border rounded bg-white font-bold"
                  value={row.scoreHome}
                  onChange={(e) => updateHistory(row.id, 'scoreHome', e.target.value)}
                />
                <span className="text-gray-400 font-bold">-</span>
                <input 
                  type="text" 
                  placeholder="0" 
                  className="w-12 text-center text-sm p-2 border rounded bg-white font-bold"
                  value={row.scoreAway}
                  onChange={(e) => updateHistory(row.id, 'scoreAway', e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Équipe Extérieur" 
                  className="flex-1 text-sm p-2 border rounded bg-white"
                  value={row.away}
                  onChange={(e) => updateHistory(row.id, 'away', e.target.value)}
                />
                <button onClick={() => removeHistoryRow(row.id)} className="p-2 text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nouveaux Matchs Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">2. Matchs à analyser</h3>
          <button onClick={addNewMatchRow} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1 px-3 rounded flex items-center gap-1">
            <Plus size={14} /> Ajouter
          </button>
        </div>
        
        {newMatches.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm italic border-2 border-dashed border-gray-100 rounded-lg">
            Aucun match à analyser.
          </div>
        ) : (
          <div className="space-y-4">
            {newMatches.map((row, index) => (
              <div key={row.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">Match {index + 1}</span>
                  <button onClick={() => removeNewMatchRow(row.id)} className="p-1 text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input 
                    type="text" 
                    placeholder="Équipe Domicile" 
                    className="text-sm p-2 border rounded bg-white"
                    value={row.home}
                    onChange={(e) => updateNewMatch(row.id, 'home', e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Équipe Extérieur" 
                    className="text-sm p-2 border rounded bg-white"
                    value={row.away}
                    onChange={(e) => updateNewMatch(row.id, 'away', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <input 
                    type="text" 
                    placeholder="Heure (ex: 14:30)" 
                    className="text-xs p-2 border rounded bg-white"
                    value={row.time}
                    onChange={(e) => updateNewMatch(row.id, 'time', e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Cote 1" 
                    className="text-xs p-2 border rounded bg-white text-center font-bold"
                    value={row.oddsHome}
                    onChange={(e) => updateNewMatch(row.id, 'oddsHome', e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Cote X" 
                    className="text-xs p-2 border rounded bg-white text-center font-bold"
                    value={row.oddsDraw}
                    onChange={(e) => updateNewMatch(row.id, 'oddsDraw', e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Cote 2" 
                    className="text-xs p-2 border rounded bg-white text-center font-bold"
                    value={row.oddsAway}
                    onChange={(e) => updateNewMatch(row.id, 'oddsAway', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleAnalyze}
        disabled={newMatches.length === 0 || isAnalyzing}
        className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
          newMatches.length === 0 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-[#2A3A5B] to-[#1A1B2E] text-white shadow-lg hover:shadow-xl hover:-translate-y-1'
        }`}
      >
        {isAnalyzing ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Search size={24} />
            </motion.div>
            Analyse en cours...
          </>
        ) : (
          <>
            <BarChart2 size={24} />
            Analyser
          </>
        )}
      </button>
      
      {isAnalyzing && (
        <div className="mt-4 text-center text-sm text-gray-500 animate-pulse">
          L'IA analyse les données historiques et calcule les probabilités...
        </div>
      )}
    </div>
  );
};
