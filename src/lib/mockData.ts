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
    generateTeamStats('eng_11', 'Brighton', 'https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_logo.svg'),
    generateTeamStats('eng_12', 'Crystal Palace', 'https://upload.wikimedia.org/wikipedia/en/0/0c/Crystal_Palace_FC_logo.svg'),
    generateTeamStats('eng_13', 'Fulham', 'https://upload.wikimedia.org/wikipedia/en/e/eb/Fulham_FC_%28shield%29.svg'),
    generateTeamStats('eng_14', 'Brentford', 'https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg'),
    generateTeamStats('eng_15', 'Wolves', 'https://upload.wikimedia.org/wikipedia/en/f/fc/Wolverhampton_Wanderers_comp.svg'),
    generateTeamStats('eng_16', 'Bournemouth', 'https://upload.wikimedia.org/wikipedia/en/e/e5/AFC_Bournemouth_%282013%29.svg'),
    generateTeamStats('eng_17', 'Nottm Forest', 'https://upload.wikimedia.org/wikipedia/en/e/e5/Nottingham_Forest_F.C._logo.svg'),
    generateTeamStats('eng_18', 'Leicester', 'https://upload.wikimedia.org/wikipedia/en/2/2d/Leicester_City_crest.svg'),
    generateTeamStats('eng_19', 'Southampton', 'https://upload.wikimedia.org/wikipedia/en/c/c9/FC_Southampton.svg'),
    generateTeamStats('eng_20', 'Ipswich', 'https://upload.wikimedia.org/wikipedia/en/4/43/Ipswich_Town.svg'),
  ],
  'ucl': [
    generateTeamStats('ucl_1', 'Real Madrid', 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg'),
    generateTeamStats('ucl_2', 'Bayern Munich', 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg'),
    generateTeamStats('ucl_3', 'PSG', 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg'),
    generateTeamStats('ucl_4', 'Inter Milan', 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg'),
    generateTeamStats('ucl_5', 'Benfica', 'https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg'),
    generateTeamStats('ucl_6', 'Ajax', 'https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg'),
    generateTeamStats('ucl_7', 'Dortmund', 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg'),
    generateTeamStats('ucl_8', 'Juventus', 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg'),
    generateTeamStats('ucl_9', 'Arsenal', 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg'),
    generateTeamStats('ucl_10', 'Man City', 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg'),
  ],
  'afr': [
    generateTeamStats('afr_1', 'Senegal', '🇸🇳'),
    generateTeamStats('afr_2', 'Egypt', '🇪🇬'),
    generateTeamStats('afr_3', 'Morocco', '🇲🇦'),
    generateTeamStats('afr_4', 'Nigeria', '🇳🇬'),
    generateTeamStats('afr_5', 'Cameroon', '🇨🇲'),
    generateTeamStats('afr_6', 'Algeria', '🇩🇿'),
    generateTeamStats('afr_7', 'Ivory Coast', '🇨🇮'),
    generateTeamStats('afr_8', 'Ghana', '🇬🇭'),
    generateTeamStats('afr_9', 'Mali', '🇲🇱'),
    generateTeamStats('afr_10', 'Tunisia', '🇹🇳'),
    generateTeamStats('afr_11', 'South Africa', '🇿🇦'),
    generateTeamStats('afr_12', 'Burkina Faso', '🇧🇫'),
    generateTeamStats('afr_13', 'DR Congo', '🇨🇩'),
    generateTeamStats('afr_14', 'Guinea', '🇬🇳'),
    generateTeamStats('afr_15', 'Zambia', '🇿🇲'),
    generateTeamStats('afr_16', 'Gabon', '🇬🇦'),
    generateTeamStats('afr_17', 'Angola', '🇦🇴'),
    generateTeamStats('afr_18', 'Cape Verde', '🇨🇻'),
    generateTeamStats('afr_19', 'Equatorial Guinea', '🇬🇶'),
    generateTeamStats('afr_20', 'Gambia', '🇬🇲'),
    generateTeamStats('afr_21', 'Mauritania', '🇲🇷'),
    generateTeamStats('afr_22', 'Namibia', '🇳🇦'),
    generateTeamStats('afr_23', 'Tanzania', '🇹🇿'),
    generateTeamStats('afr_24', 'Mozambique', '🇲🇿'),
  ],
  'ita': [
    generateTeamStats('ita_1', 'Juventus', 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg'),
    generateTeamStats('ita_2', 'Inter', 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg'),
    generateTeamStats('ita_3', 'AC Milan', 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg'),
    generateTeamStats('ita_4', 'Napoli', 'https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Napoli_2021_logo.svg'),
    generateTeamStats('ita_5', 'Roma', 'https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg'),
    generateTeamStats('ita_6', 'Lazio', 'https://upload.wikimedia.org/wikipedia/en/c/ce/S.S._Lazio_badge.svg'),
    generateTeamStats('ita_7', 'Atalanta', 'https://upload.wikimedia.org/wikipedia/en/6/66/AtalantaBC.svg'),
    generateTeamStats('ita_8', 'Fiorentina', 'https://upload.wikimedia.org/wikipedia/commons/1/1c/ACF_Fiorentina_logo_%282022%29.svg'),
    generateTeamStats('ita_9', 'Torino', 'https://upload.wikimedia.org/wikipedia/en/2/2e/Torino_FC_Logo.svg'),
    generateTeamStats('ita_10', 'Bologna', 'https://upload.wikimedia.org/wikipedia/en/5/5b/Bologna_F.C._1909_logo.svg'),
  ],
  'spa': [
    generateTeamStats('spa_1', 'Real Madrid', 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg'),
    generateTeamStats('spa_2', 'Barcelona', 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg'),
    generateTeamStats('spa_3', 'Atletico Madrid', 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg'),
    generateTeamStats('spa_4', 'Sevilla', 'https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg'),
    generateTeamStats('spa_5', 'Valencia', 'https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg'),
    generateTeamStats('spa_6', 'Villarreal', 'https://upload.wikimedia.org/wikipedia/en/7/70/Villarreal_CF_logo.svg'),
    generateTeamStats('spa_7', 'Real Sociedad', 'https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg'),
    generateTeamStats('spa_8', 'Athletic Bilbao', 'https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg'),
    generateTeamStats('spa_9', 'Betis', 'https://upload.wikimedia.org/wikipedia/en/1/13/Real_Betis_logo.svg'),
    generateTeamStats('spa_10', 'Celta Vigo', 'https://upload.wikimedia.org/wikipedia/en/1/12/RC_Celta_de_Vigo_logo.svg'),
  ],
  'fra': [
    generateTeamStats('fra_1', 'PSG', 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg'),
    generateTeamStats('fra_2', 'Marseille', 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg'),
    generateTeamStats('fra_3', 'Lyon', 'https://upload.wikimedia.org/wikipedia/en/c/c6/Olympique_Lyonnais.svg'),
    generateTeamStats('fra_4', 'Monaco', 'https://upload.wikimedia.org/wikipedia/en/b/ba/AS_Monaco_FC.svg'),
    generateTeamStats('fra_5', 'Lille', 'https://upload.wikimedia.org/wikipedia/en/6/6f/Lille_OSC_2018_logo.svg'),
    generateTeamStats('fra_6', 'Rennes', 'https://upload.wikimedia.org/wikipedia/en/9/9e/Stade_Rennais_FC.svg'),
    generateTeamStats('fra_7', 'Nice', 'https://upload.wikimedia.org/wikipedia/en/2/2e/OGC_Nice_logo.svg'),
    generateTeamStats('fra_8', 'Lens', 'https://upload.wikimedia.org/wikipedia/en/c/cc/RC_Lens_logo.svg'),
    generateTeamStats('fra_9', 'Nantes', 'https://upload.wikimedia.org/wikipedia/commons/5/5c/FC_Nantes_logo_%282019%29.svg'),
    generateTeamStats('fra_10', 'Montpellier', 'https://upload.wikimedia.org/wikipedia/commons/9/99/Montpellier_H%C3%A9rault_Sport_Club_logo.svg'),
  ],
  'ger': [
    generateTeamStats('ger_1', 'Bayern Munich', 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg'),
    generateTeamStats('ger_2', 'Dortmund', 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg'),
    generateTeamStats('ger_3', 'RB Leipzig', 'https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg'),
    generateTeamStats('ger_4', 'Leverkusen', 'https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg'),
    generateTeamStats('ger_5', 'Frankfurt', 'https://upload.wikimedia.org/wikipedia/commons/0/04/Eintracht_Frankfurt_Logo.svg'),
    generateTeamStats('ger_6', 'Wolfsburg', 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Logo-VfL-Wolfsburg.svg'),
    generateTeamStats('ger_7', 'Monchengladbach', 'https://upload.wikimedia.org/wikipedia/commons/8/81/Borussia_M%C3%B6nchengladbach_logo.svg'),
    generateTeamStats('ger_8', 'Stuttgart', 'https://upload.wikimedia.org/wikipedia/commons/e/eb/VfB_Stuttgart_1893_Logo.svg'),
    generateTeamStats('ger_9', 'Union Berlin', 'https://upload.wikimedia.org/wikipedia/commons/4/44/1._FC_Union_Berlin_Logo.svg'),
    generateTeamStats('ger_10', 'Freiburg', 'https://upload.wikimedia.org/wikipedia/en/d/df/SC_Freiburg_logo.svg'),
  ],
  'por': [
    generateTeamStats('por_1', 'Benfica', 'https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg'),
    generateTeamStats('por_2', 'Porto', 'https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Porto.svg'),
    generateTeamStats('por_3', 'Sporting CP', 'https://upload.wikimedia.org/wikipedia/en/e/e2/Sporting_Clube_de_Portugal_logo.svg'),
    generateTeamStats('por_4', 'Braga', 'https://upload.wikimedia.org/wikipedia/en/f/f3/Sporting_Clube_de_Braga_logo.svg'),
    generateTeamStats('por_5', 'Vitoria Guimaraes', 'https://upload.wikimedia.org/wikipedia/en/3/3b/Vit%C3%B3ria_S.C._logo.svg'),
    generateTeamStats('por_6', 'Boavista', 'https://upload.wikimedia.org/wikipedia/en/1/1a/Boavista_F.C._logo.svg'),
    generateTeamStats('por_7', 'Maritimo', 'https://upload.wikimedia.org/wikipedia/en/3/3c/C.S._Mar%C3%ADtimo_logo.svg'),
    generateTeamStats('por_8', 'Rio Ave', 'https://upload.wikimedia.org/wikipedia/en/c/c0/Rio_Ave_F.C._logo.svg'),
    generateTeamStats('por_9', 'Famalicao', 'https://upload.wikimedia.org/wikipedia/en/e/eb/F.C._Famalic%C3%A3o_logo.svg'),
    generateTeamStats('por_10', 'Gil Vicente', 'https://upload.wikimedia.org/wikipedia/en/c/c8/Gil_Vicente_F.C._logo.svg'),
  ],
};
