export interface TeamStats {
  id: string;
  name: string;
  logo?: string;
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  last5Matches: ('W' | 'D' | 'L')[];
}

export interface FullOdds {
  main: {
    '1X2': { home: number; draw: number; away: number };
    doubleChance: { '1X': number; '12': number; 'X2': number };
    htft: { '1/1': number; '1/X': number; '1/2': number; 'X/1': number; 'X/X': number; 'X/2': number; '2/1': number; '2/X': number; '2/2': number };
    exactScore: Record<string, number>;
    totalGoals: { '0-1': number; '2-3': number; '4+': number };
    overUnder: {
      '0.5': { over: number; under: number };
      '1.5': { over: number; under: number };
      '2.5': { over: number; under: number };
      '3.5': { over: number; under: number };
    };
  };
  halfTime: {
    '1X2': { home: number; draw: number; away: number };
    doubleChance: { '1X': number; '12': number; 'X2': number };
    exactScore: Record<string, number>;
  };
  goals: {
    gng: { goal: number; noGoal: number };
    btts: { yes: number; no: number };
    bttsFirstHalf: { yes: number; no: number };
    ftts: { home: number; away: number; none: number };
  };
  combo: {
    '1X2_O1.5': { home: number; draw: number; away: number };
    '1X2_O2.5': { home: number; draw: number; away: number };
    '1X2_O3.5': { home: number; draw: number; away: number };
    '1X2_GNG': { homeYes: number; homeNo: number; awayYes: number; awayNo: number; drawYes: number; drawNo: number };
  };
  teamTotals: {
    home: {
      '0.5': { over: number; under: number };
      '1.5': { over: number; under: number };
      '2.5': { over: number; under: number };
      '3.5': { over: number; under: number };
    };
    away: {
      '0.5': { over: number; under: number };
      '1.5': { over: number; under: number };
      '2.5': { over: number; under: number };
      '3.5': { over: number; under: number };
    };
  };
  special: {
    oddEven: { odd: number; even: number };
    firstGoalMinute: { '0-15': number; '16-30': number; '31-45': number; '46-60': number; '61-75': number; '76-90': number; 'None': number };
    multiGoals: { '1-2': number; '1-3': number; '2-3': number; '2-4': number; '3-4': number; '3-5': number };
  };
}

export interface Match {
  id: string;
  leagueId: string;
  leagueName: string;
  country: string;
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  date: string;
  status: 'NS' | 'LIVE' | 'FT';
  homeScore?: number;
  awayScore?: number;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  fullOdds?: FullOdds;
  isHotMatch?: boolean;
  hotReason?: string;
  liveEvent?: string;
}

export interface PredictionResult {
  matchCible: {
    bestPrediction: '1' | 'X' | '2';
    exactScore: string;
    confidence: number;
  };
  safeBets: {
    over15: boolean;
    under45: boolean;
    doubleChance: string;
  };
  advanced: {
    btts: boolean;
    over25: boolean;
    cleanSheet: string; // 'Home', 'Away', 'None'
  };
  vip: {
    exactScoreAlt: string;
    comboBet: string;
    highOddsPrediction: string;
    highOddsValue: number;
  };
  riskLevel: 'SAFE' | 'MEDIUM' | 'HIGH RISK';
  powerScores: {
    home: number;
    away: number;
  };
  expectedGoals: {
    home: number;
    away: number;
  };
  winProbability: {
    home: number;
    draw: number;
    away: number;
  };
}

function calculateFormScore(last5: ('W' | 'D' | 'L')[]): number {
  return last5.reduce((score, result) => {
    if (result === 'W') return score + 3;
    if (result === 'D') return score + 1;
    return score;
  }, 0);
}

export function generateFullOdds(homePower: number, awayPower: number, base1X2: { home: number, draw: number, away: number }): FullOdds {
  const diff = homePower - awayPower;
  const homeFav = diff > 0;
  
  // Helper to add margin
  const addMargin = (odds: number) => Math.max(1.01, Number((odds * 0.92).toFixed(2)));
  
  // Double Chance
  const dc1X = addMargin(1 / ((1/base1X2.home) + (1/base1X2.draw)));
  const dc12 = addMargin(1 / ((1/base1X2.home) + (1/base1X2.away)));
  const dcX2 = addMargin(1 / ((1/base1X2.draw) + (1/base1X2.away)));

  // Over/Under base probabilities based on power
  const totalPower = homePower + awayPower;
  const expectedGoals = (totalPower / 100) * 2.5; // Rough estimate
  
  const probO15 = Math.min(0.9, Math.max(0.4, expectedGoals / 3));
  const probO25 = probO15 * 0.6;
  const probO35 = probO25 * 0.5;
  const probO05 = Math.min(0.95, probO15 * 1.2);

  const ou = (prob: number) => ({
    over: addMargin(1 / prob),
    under: addMargin(1 / (1 - prob))
  });

  const bttsProb = Math.min(0.8, Math.max(0.3, 0.5 - Math.abs(diff)/200 + expectedGoals/10));

  return {
    main: {
      '1X2': base1X2,
      doubleChance: { '1X': dc1X, '12': dc12, 'X2': dcX2 },
      htft: {
        '1/1': addMargin(base1X2.home * 1.5), '1/X': addMargin(15.0), '1/2': addMargin(30.0),
        'X/1': addMargin(base1X2.home * 2.5), 'X/X': addMargin(base1X2.draw * 1.5), 'X/2': addMargin(base1X2.away * 2.5),
        '2/1': addMargin(30.0), '2/X': addMargin(15.0), '2/2': addMargin(base1X2.away * 1.5)
      },
      exactScore: {
        '1-0': addMargin(base1X2.home * 3), '2-0': addMargin(base1X2.home * 4), '2-1': addMargin(base1X2.home * 4.5),
        '0-0': addMargin(base1X2.draw * 2.5), '1-1': addMargin(base1X2.draw * 2), '2-2': addMargin(base1X2.draw * 4),
        '0-1': addMargin(base1X2.away * 3), '0-2': addMargin(base1X2.away * 4), '1-2': addMargin(base1X2.away * 4.5),
      },
      totalGoals: {
        '0-1': ou(probO15).under,
        '2-3': addMargin(2.0),
        '4+': ou(probO35).over
      },
      overUnder: {
        '0.5': ou(probO05),
        '1.5': ou(probO15),
        '2.5': ou(probO25),
        '3.5': ou(probO35)
      }
    },
    halfTime: {
      '1X2': {
        home: addMargin(base1X2.home * 1.8),
        draw: addMargin(base1X2.draw * 0.8),
        away: addMargin(base1X2.away * 1.8)
      },
      doubleChance: {
        '1X': addMargin(dc1X * 1.2),
        '12': addMargin(dc12 * 1.5),
        'X2': addMargin(dcX2 * 1.2)
      },
      exactScore: {
        '0-0': addMargin(2.5), '1-0': addMargin(3.5), '0-1': addMargin(4.5), '1-1': addMargin(7.0)
      }
    },
    goals: {
      gng: { goal: ou(probO05).over, noGoal: ou(probO05).under },
      btts: { yes: addMargin(1 / bttsProb), no: addMargin(1 / (1 - bttsProb)) },
      bttsFirstHalf: { yes: addMargin(1 / (bttsProb * 0.3)), no: addMargin(1 / (1 - bttsProb * 0.3)) },
      ftts: { home: addMargin(base1X2.home * 1.2), away: addMargin(base1X2.away * 1.2), none: ou(probO05).under }
    },
    combo: {
      '1X2_O1.5': {
        home: addMargin(base1X2.home * ou(probO15).over * 0.8),
        draw: addMargin(base1X2.draw * ou(probO15).over * 0.8),
        away: addMargin(base1X2.away * ou(probO15).over * 0.8)
      },
      '1X2_O2.5': {
        home: addMargin(base1X2.home * ou(probO25).over * 0.8),
        draw: addMargin(base1X2.draw * ou(probO25).over * 0.8),
        away: addMargin(base1X2.away * ou(probO25).over * 0.8)
      },
      '1X2_O3.5': {
        home: addMargin(base1X2.home * ou(probO35).over * 0.8),
        draw: addMargin(base1X2.draw * ou(probO35).over * 0.8),
        away: addMargin(base1X2.away * ou(probO35).over * 0.8)
      },
      '1X2_GNG': {
        homeYes: addMargin(base1X2.home * (1/bttsProb) * 0.8),
        homeNo: addMargin(base1X2.home * (1/(1-bttsProb)) * 0.8),
        awayYes: addMargin(base1X2.away * (1/bttsProb) * 0.8),
        awayNo: addMargin(base1X2.away * (1/(1-bttsProb)) * 0.8),
        drawYes: addMargin(base1X2.draw * (1/bttsProb) * 0.8),
        drawNo: addMargin(base1X2.draw * (1/(1-bttsProb)) * 0.8)
      }
    },
    teamTotals: {
      home: {
        '0.5': ou(homeFav ? probO15 : probO15 * 0.7),
        '1.5': ou(homeFav ? probO25 : probO25 * 0.7),
        '2.5': ou(homeFav ? probO35 : probO35 * 0.7),
        '3.5': ou(homeFav ? probO35 * 0.5 : probO35 * 0.3)
      },
      away: {
        '0.5': ou(!homeFav ? probO15 : probO15 * 0.7),
        '1.5': ou(!homeFav ? probO25 : probO25 * 0.7),
        '2.5': ou(!homeFav ? probO35 : probO35 * 0.7),
        '3.5': ou(!homeFav ? probO35 * 0.5 : probO35 * 0.3)
      }
    },
    special: {
      oddEven: { odd: 1.90, even: 1.90 },
      firstGoalMinute: {
        '0-15': addMargin(3.0), '16-30': addMargin(3.5), '31-45': addMargin(4.0),
        '46-60': addMargin(4.5), '61-75': addMargin(5.0), '76-90': addMargin(5.5),
        'None': ou(probO05).under
      },
      multiGoals: {
        '1-2': addMargin(2.0), '1-3': addMargin(1.4), '2-3': addMargin(1.9),
        '2-4': addMargin(1.5), '3-4': addMargin(2.4), '3-5': addMargin(2.2)
      }
    }
  };
}

export function simulateScore(homeXG: number, awayXG: number, seedStr: string): { homeScore: number, awayScore: number } {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed += seedStr.charCodeAt(i);
  }
  
  const random = () => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const generateGoals = (xg: number) => {
    let L = Math.exp(-xg);
    let p = 1.0;
    let k = 0;
    do {
      k++;
      p *= random();
    } while (p > L);
    return k - 1;
  };

  return {
    homeScore: generateGoals(homeXG),
    awayScore: generateGoals(awayXG)
  };
}

const predictionCache = new Map<string, PredictionResult>();

export function analyzeMatch(match: Match): PredictionResult {
  if (predictionCache.has(match.id)) {
    return predictionCache.get(match.id)!;
  }

  const home = match.homeTeam;
  const away = match.awayTeam;

  // 1. Compute basic metrics
  const homeAttack = home.totalMatches > 0 ? home.goalsScored / home.totalMatches : 0;
  const homeDefense = home.totalMatches > 0 ? home.goalsConceded / home.totalMatches : 0;
  const homeForm = calculateFormScore(home.last5Matches);

  const awayAttack = away.totalMatches > 0 ? away.goalsScored / away.totalMatches : 0;
  const awayDefense = away.totalMatches > 0 ? away.goalsConceded / away.totalMatches : 0;
  const awayForm = calculateFormScore(away.last5Matches);

  // 2. Calculate Power Score
  const homePower = (homeAttack * 0.4) + (homeForm * 0.4) - (homeDefense * 0.2);
  const awayPower = (awayAttack * 0.4) + (awayForm * 0.4) - (awayDefense * 0.2);

  // 3. Expected Goals (simplified model)
  const homeXG = Math.max(0.5, (homeAttack + awayDefense) / 2 + 0.2); // Home advantage
  const awayXG = Math.max(0.5, (awayAttack + homeDefense) / 2);

  // 4. Win Probability
  const totalPower = homePower + awayPower + 2; // +2 to avoid zero division and add base draw chance
  let homeProb = homePower / totalPower;
  let awayProb = awayPower / totalPower;
  let drawProb = 1 - homeProb - awayProb;

  // Adjust probabilities based on xG difference
  const xGDiff = homeXG - awayXG;
  if (xGDiff > 1) {
    homeProb += 0.1;
    awayProb -= 0.05;
    drawProb -= 0.05;
  } else if (xGDiff < -1) {
    awayProb += 0.1;
    homeProb -= 0.05;
    drawProb -= 0.05;
  } else if (Math.abs(xGDiff) < 0.3) {
    drawProb += 0.1;
    homeProb -= 0.05;
    awayProb -= 0.05;
  }

  // Normalize
  const sum = homeProb + awayProb + drawProb;
  homeProb = Math.max(0.05, homeProb / sum);
  awayProb = Math.max(0.05, awayProb / sum);
  drawProb = Math.max(0.05, drawProb / sum);

  // 5. Most likely score
  const homeScorePred = Math.round(homeXG);
  const awayScorePred = Math.round(awayXG);
  const exactScore = `${homeScorePred}-${awayScorePred}`;

  // 6. Best Prediction
  let bestPred: '1' | 'X' | '2' = '1';
  let confidence = homeProb * 100;
  if (awayProb > homeProb && awayProb > drawProb) {
    bestPred = '2';
    confidence = awayProb * 100;
  } else if (drawProb > homeProb && drawProb > awayProb) {
    bestPred = 'X';
    confidence = drawProb * 100;
  }

  // 7. Safe Bets
  const totalXG = homeXG + awayXG;
  const over15 = totalXG > 1.8;
  const under45 = totalXG < 4.0;
  const doubleChance = bestPred === '1' ? '1X' : bestPred === '2' ? 'X2' : '1X';

  // 8. Advanced
  const btts = homeXG > 0.8 && awayXG > 0.8;
  const over25 = totalXG > 2.6;
  const cleanSheet = homeXG < 0.5 ? 'Away' : awayXG < 0.5 ? 'Home' : 'None';

  // 9. VIP
  const exactScoreAlt = `${Math.max(0, homeScorePred + (bestPred === '1' ? 1 : -1))}-${Math.max(0, awayScorePred + (bestPred === '2' ? 1 : -1))}`;
  const comboBet = `${bestPred} & ${over15 ? 'Over 1.5' : 'Under 3.5'}`;
  const highOddsPrediction = `${exactScore} & ${btts ? 'BTTS Yes' : 'BTTS No'}`;
  const highOddsValue = parseFloat((Math.max(match.odds.home, match.odds.away) * 2.5).toFixed(2));

  // 10. Risk Level
  let riskLevel: 'SAFE' | 'MEDIUM' | 'HIGH RISK' = 'MEDIUM';
  if (confidence > 65 && over15) {
    riskLevel = 'SAFE';
  } else if (confidence < 45 || (homeProb > 0.3 && awayProb > 0.3)) {
    riskLevel = 'HIGH RISK';
  }

  const result: PredictionResult = {
    matchCible: {
      bestPrediction: bestPred,
      exactScore,
      confidence: Math.round(confidence),
    },
    safeBets: {
      over15,
      under45,
      doubleChance,
    },
    advanced: {
      btts,
      over25,
      cleanSheet,
    },
    vip: {
      exactScoreAlt,
      comboBet,
      highOddsPrediction,
      highOddsValue,
    },
    riskLevel,
    powerScores: {
      home: parseFloat(homePower.toFixed(2)),
      away: parseFloat(awayPower.toFixed(2)),
    },
    expectedGoals: {
      home: parseFloat(homeXG.toFixed(2)),
      away: parseFloat(awayXG.toFixed(2)),
    },
    winProbability: {
      home: parseFloat((homeProb * 100).toFixed(1)),
      draw: parseFloat((drawProb * 100).toFixed(1)),
      away: parseFloat((awayProb * 100).toFixed(1)),
    },
  };

  predictionCache.set(match.id, result);
  
  // Keep cache size manageable
  if (predictionCache.size > 2000) {
    const firstKey = predictionCache.keys().next().value;
    if (firstKey) predictionCache.delete(firstKey);
  }
  
  return result;
}
