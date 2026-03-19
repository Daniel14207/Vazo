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

export function analyzeMatch(match: Match): PredictionResult {
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

  return {
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
}
