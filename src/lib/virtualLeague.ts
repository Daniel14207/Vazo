import { useState, useEffect, useMemo } from 'react';
import { Match, analyzeMatch, simulateScore, generateFullOdds } from './predictionEngine';
import { leagues, teamsByLeague } from './mockData';

export type Phase = 'OPEN' | 'PLAYING' | 'FINISHED' | 'BREAK';

export interface TimeSlot {
  time: Date;
  matches: Match[];
  status: Phase;
  isNewCycle?: boolean;
}

export interface LeagueState {
  leagueId: string;
  leagueName: string;
  leagueLogo?: string;
  slots: TimeSlot[];
  currentSlotTime: Date | null;
  phase: Phase;
  timeInSlot: number;
  isBreak: boolean;
  breakTimeRemaining: number;
}

const CYCLE_DURATION = 45 * 60 * 1000; // 45 mins
const SLOT_DURATION = 2 * 60 * 1000; // 2 mins
const SLOTS_PER_CYCLE = 20;

export function useVirtualLeague(): LeagueState[] {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const ms = currentTime.getTime();

  return useMemo(() => {
    return leagues.map(league => {
      const leagueMs = ms;
      
      const cycleIndex = Math.floor(leagueMs / CYCLE_DURATION);
      const timeInCycle = leagueMs % CYCLE_DURATION;
      
      const isBreak = timeInCycle >= SLOTS_PER_CYCLE * SLOT_DURATION;
      const currentSlotIndex = isBreak ? -1 : Math.floor(timeInCycle / SLOT_DURATION);
      
      const timeInSlot = isBreak 
        ? timeInCycle - SLOTS_PER_CYCLE * SLOT_DURATION
        : timeInCycle % SLOT_DURATION;

      let phase: Phase = 'OPEN';
      if (isBreak) {
        phase = 'BREAK';
      } else {
        if (timeInSlot < 40000) phase = 'OPEN'; // 0-40s: Betting
        else if (timeInSlot < 100000) phase = 'PLAYING'; // 40-100s: Simulation
        else phase = 'FINISHED'; // 100-120s: Result
      }

      const generatedSlots: TimeSlot[] = [];
      
      for (let i = -1; i <= 2; i++) {
        let targetCycleIndex = cycleIndex;
        let targetSlotIndex = currentSlotIndex + i;
        
        if (isBreak) {
          targetSlotIndex = i >= 0 ? i : SLOTS_PER_CYCLE - 1;
          targetCycleIndex = i >= 0 ? cycleIndex + 1 : cycleIndex;
        } else if (targetSlotIndex >= SLOTS_PER_CYCLE) {
          targetSlotIndex = targetSlotIndex - SLOTS_PER_CYCLE;
          targetCycleIndex = cycleIndex + 1;
        } else if (targetSlotIndex < 0) {
          targetSlotIndex = targetSlotIndex + SLOTS_PER_CYCLE;
          targetCycleIndex = cycleIndex - 1;
        }

        const slotTimeMs = targetCycleIndex * CYCLE_DURATION + targetSlotIndex * SLOT_DURATION;
        const slotTime = new Date(slotTimeMs);
        
        const numMatches = league.id === 'caf' ? 20 : 10;
        
        generatedSlots.push({
          time: slotTime,
          matches: generateMatchesForLeagueSlot(league.id, slotTime, numMatches),
          status: 'OPEN',
          isNewCycle: targetSlotIndex === 0
        });
      }

      const processedSlots = generatedSlots.map(slot => {
        let slotStatus: Phase = 'OPEN';
        const slotTimeMs = slot.time.getTime();
        const currentSlotTimeMs = isBreak ? -1 : cycleIndex * CYCLE_DURATION + currentSlotIndex * SLOT_DURATION;
        
        if (slotTimeMs < currentSlotTimeMs) slotStatus = 'FINISHED';
        else if (slotTimeMs === currentSlotTimeMs) slotStatus = phase;
        else slotStatus = 'OPEN';

        const processedMatches = slot.matches.map(match => {
          const prediction = analyzeMatch(match);
          
          let homeScore = undefined;
          let awayScore = undefined;
          let status = match.status;
          let liveEvent = undefined;
          let odds = { ...match.odds };
          
          if (slotStatus === 'OPEN') {
             const step = Math.floor(timeInSlot / 3000);
             const seed = match.id + step;
             let rng = 0;
             for (let i = 0; i < seed.length; i++) rng += seed.charCodeAt(i);
             const fluctuation = (Math.sin(rng) * 0.1) - 0.05;
             
             odds.home = Math.max(1.01, parseFloat((odds.home + fluctuation).toFixed(2)));
             odds.draw = Math.max(1.01, parseFloat((odds.draw - fluctuation * 0.5).toFixed(2)));
             odds.away = Math.max(1.01, parseFloat((odds.away - fluctuation * 0.5).toFixed(2)));
          } else if (slotStatus === 'FINISHED' || slotStatus === 'PLAYING') {
             const score = simulateScore(prediction.expectedGoals.home, prediction.expectedGoals.away, match.id);
             
             if (slotStatus === 'FINISHED') {
               homeScore = score.homeScore;
               awayScore = score.awayScore;
               status = 'FT';
             } else if (slotStatus === 'PLAYING') {
               const progress = (timeInSlot - 40000) / 60000;
               homeScore = Math.floor(score.homeScore * Math.min(1, progress * 1.2));
               awayScore = Math.floor(score.awayScore * Math.min(1, progress * 1.2));
               status = 'LIVE';
               
               const step = Math.floor(timeInSlot / 5000);
               const seed = match.id + step;
               let rng = 0;
               for (let i = 0; i < seed.length; i++) rng += seed.charCodeAt(i);
               const eventRoll = Math.abs(Math.sin(rng));
               
               if (eventRoll > 0.9) liveEvent = 'GOAL!';
               else if (eventRoll > 0.7) liveEvent = 'ATTACK';
               else if (eventRoll > 0.5) liveEvent = 'FOUL';
               else if (eventRoll > 0.4) liveEvent = 'CARD';
             }
          }

          return {
            ...match,
            homeScore,
            awayScore,
            status,
            liveEvent,
            odds
          };
        });

        return {
          ...slot,
          status: slotStatus,
          matches: processedMatches
        };
      });

      return {
        leagueId: league.id,
        leagueName: league.name,
        leagueLogo: league.logo,
        slots: processedSlots,
        currentSlotTime: isBreak ? null : new Date(cycleIndex * CYCLE_DURATION + currentSlotIndex * SLOT_DURATION),
        phase,
        timeInSlot,
        isBreak,
        breakTimeRemaining: isBreak ? (5 * 60 * 1000) - timeInSlot : 0
      };
    });
  }, [ms]);
}

function calculateFormScore(last5: ('W' | 'D' | 'L')[]): number {
  return last5.reduce((score, result) => {
    if (result === 'W') return score + 3;
    if (result === 'D') return score + 1;
    return score;
  }, 0);
}

function generateMatchesForLeagueSlot(leagueId: string, time: Date, count: number): Match[] {
  let seed = time.getTime() + leagueId.charCodeAt(0);
  const random = () => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const matches: Match[] = [];
  const league = leagues.find(l => l.id === leagueId);
  if (!league) return matches;

  const leagueTeams = teamsByLeague[league.id];
  const shuffledTeams = [...leagueTeams].sort(() => random() - 0.5);
  
  // Generate pairs of matches, up to the count requested or half the teams
  const matchCount = Math.min(count, Math.floor(shuffledTeams.length / 2));
  
  for (let i = 0; i < matchCount; i++) {
    const homeTeam = shuffledTeams[i * 2];
    const awayTeam = shuffledTeams[i * 2 + 1];
    
    const homeAttack = homeTeam.goalsScored / homeTeam.totalMatches;
    const homeDefense = homeTeam.goalsConceded / homeTeam.totalMatches;
    const homeForm = calculateFormScore(homeTeam.last5Matches);

    const awayAttack = awayTeam.goalsScored / awayTeam.totalMatches;
    const awayDefense = awayTeam.goalsConceded / awayTeam.totalMatches;
    const awayForm = calculateFormScore(awayTeam.last5Matches);

    const homePower = (homeAttack * 0.4) + (homeForm * 0.4) - (homeDefense * 0.2);
    const awayPower = (awayAttack * 0.4) + (awayForm * 0.4) - (awayDefense * 0.2);
    
    const total = homePower + awayPower + 1;
    let homeProb = homePower / total;
    let awayProb = awayPower / total;
    let drawProb = 1 - homeProb - awayProb;

    homeProb = Math.max(0.1, homeProb);
    awayProb = Math.max(0.1, awayProb);
    drawProb = Math.max(0.1, drawProb);

    let isHotMatch = false;
    let hotReason = '';

    if (homeProb > 0.75 || awayProb > 0.75) {
      isHotMatch = true;
      hotReason = '💎 VIP PICK';
    } else if (homeAttack + awayAttack > 4.0) {
      isHotMatch = true;
      hotReason = '🔥 HOT MATCH';
    } else if (Math.abs(homePower - awayPower) > 2.5) {
      isHotMatch = true;
      hotReason = '⚡ HIGH ODDS';
    }

    const baseOdds = {
      home: parseFloat((1 / homeProb).toFixed(2)),
      draw: parseFloat((1 / drawProb).toFixed(2)),
      away: parseFloat((1 / awayProb).toFixed(2))
    };

    matches.push({
      id: `m_${time.getTime()}_${league.id}_${i}`,
      leagueId: league.id,
      leagueName: league.name,
      country: league.country,
      date: time.toISOString(),
      status: 'NS',
      homeTeam,
      awayTeam,
      isHotMatch,
      hotReason,
      odds: baseOdds,
      fullOdds: generateFullOdds(homePower, awayPower, baseOdds)
    });
  }
  return matches;
}
