import { TeamStats } from './predictionEngine';

export const leagues = [
  { id: 'eng', name: 'English League', country: 'England', logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'ucl', name: 'Champions League', country: 'Europe', logo: '⭐' },
  { id: 'afr', name: 'Africa Cup', country: 'Africa', logo: '🌍' },
  { id: 'ita', name: 'Italian League', country: 'Italy', logo: '🇮🇹' },
  { id: 'spa', name: 'Spanish League', country: 'Spain', logo: '🇪🇸' },
  { id: 'fra', name: 'French League', country: 'France', logo: '🇫🇷' },
  { id: 'ger', name: 'German League', country: 'Germany', logo: '🇩🇪' },
  { id: 'por', name: 'Portuguese League', country: 'Portugal', logo: '🇵🇹' },
];

const generateTeamStats = (id: string, name: string, logo?: string): TeamStats => {
  const totalMatches = 20 + Math.floor(Math.random() * 10);
  const wins = Math.floor(totalMatches * (0.3 + Math.random() * 0.4));
  const draws = Math.floor((totalMatches - wins) * 0.5);
  const losses = totalMatches - wins - draws;
  const goalsScored = wins * 2 + draws * 1 + Math.floor(Math.random() * 10);
  const goalsConceded = losses * 2 + draws * 1 + Math.floor(Math.random() * 10);
  
  const last5Matches: ('W' | 'D' | 'L')[] = [];
  for (let i = 0; i < 5; i++) {
    const r = Math.random();
    if (r < 0.4) last5Matches.push('W');
    else if (r < 0.7) last5Matches.push('D');
    else last5Matches.push('L');
  }

  return {
    id,
    name,
    logo,
    totalMatches,
    wins,
    draws,
    losses,
    goalsScored,
    goalsConceded,
    last5Matches
  };
};

export const teamsByLeague: Record<string, TeamStats[]> = {
  'eng': [
    generateTeamStats('eng_1', 'Arsenal', 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg'), 
    generateTeamStats('eng_2', 'Aston Villa', 'https://upload.wikimedia.org/wikipedia/en/f/f9/Aston_Villa_FC_crest_%282016%29.svg'),
    generateTeamStats('eng_3', 'Chelsea', 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg'), 
    generateTeamStats('eng_4', 'Everton', 'https://upload.wikimedia.org/wikipedia/en/f/f9/Everton_FC_logo.svg'),
    generateTeamStats('eng_5', 'Liverpool', 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg'), 
    generateTeamStats('eng_6', 'Man City', 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg'),
    generateTeamStats('eng_7', 'Man Utd', 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg'), 
    generateTeamStats('eng_8', 'Newcastle', 'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg'),
    generateTeamStats('eng_9', 'Tottenham', 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg'), 
    generateTeamStats('eng_10', 'West Ham', 'https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg'),
  ],
  'ucl': [
    generateTeamStats('ucl_1', 'Real Madrid'), generateTeamStats('ucl_2', 'Bayern Munich'),
    generateTeamStats('ucl_3', 'PSG'), generateTeamStats('ucl_4', 'Inter Milan'),
    generateTeamStats('ucl_5', 'Benfica'), generateTeamStats('ucl_6', 'Ajax'),
    generateTeamStats('ucl_7', 'Dortmund'), generateTeamStats('ucl_8', 'Juventus'),
  ],
  'afr': [
    generateTeamStats('afr_1', 'Senegal'), generateTeamStats('afr_2', 'Egypt'),
    generateTeamStats('afr_3', 'Morocco'), generateTeamStats('afr_4', 'Nigeria'),
    generateTeamStats('afr_5', 'Cameroon'), generateTeamStats('afr_6', 'Algeria'),
    generateTeamStats('afr_7', 'Ivory Coast'), generateTeamStats('afr_8', 'Ghana'),
  ],
  'ita': [
    generateTeamStats('ita_1', 'Juventus'), generateTeamStats('ita_2', 'Inter'),
    generateTeamStats('ita_3', 'AC Milan'), generateTeamStats('ita_4', 'Napoli'),
    generateTeamStats('ita_5', 'Roma'), generateTeamStats('ita_6', 'Lazio'),
    generateTeamStats('ita_7', 'Atalanta'), generateTeamStats('ita_8', 'Fiorentina'),
  ],
  'spa': [
    generateTeamStats('spa_1', 'Real Madrid'), generateTeamStats('spa_2', 'Barcelona'),
    generateTeamStats('spa_3', 'Atletico Madrid'), generateTeamStats('spa_4', 'Sevilla'),
    generateTeamStats('spa_5', 'Valencia'), generateTeamStats('spa_6', 'Villarreal'),
    generateTeamStats('spa_7', 'Real Sociedad'), generateTeamStats('spa_8', 'Athletic Bilbao'),
  ],
  'fra': [
    generateTeamStats('fra_1', 'PSG'), generateTeamStats('fra_2', 'Marseille'),
    generateTeamStats('fra_3', 'Lyon'), generateTeamStats('fra_4', 'Monaco'),
    generateTeamStats('fra_5', 'Lille'), generateTeamStats('fra_6', 'Rennes'),
    generateTeamStats('fra_7', 'Nice'), generateTeamStats('fra_8', 'Lens'),
  ],
  'ger': [
    generateTeamStats('ger_1', 'Bayern Munich'), generateTeamStats('ger_2', 'Dortmund'),
    generateTeamStats('ger_3', 'RB Leipzig'), generateTeamStats('ger_4', 'Leverkusen'),
    generateTeamStats('ger_5', 'Frankfurt'), generateTeamStats('ger_6', 'Wolfsburg'),
    generateTeamStats('ger_7', 'Monchengladbach'), generateTeamStats('ger_8', 'Stuttgart'),
  ],
  'por': [
    generateTeamStats('por_1', 'Benfica'), generateTeamStats('por_2', 'Porto'),
    generateTeamStats('por_3', 'Sporting CP'), generateTeamStats('por_4', 'Braga'),
    generateTeamStats('por_5', 'Vitoria Guimaraes'), generateTeamStats('por_6', 'Boavista'),
    generateTeamStats('por_7', 'Maritimo'), generateTeamStats('por_8', 'Rio Ave'),
  ],
};
