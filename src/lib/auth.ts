
export interface AnalysisHistory {
  time: string;
  type: 'Virtuel' | 'Aviator';
  result: string;
  match?: string;
}

export interface User {
  id: string;
  phone: string;
  password: string;
  tokens: number;
  expirationDate: string | null;
  createdAt: string;
  analysisHistory?: AnalysisHistory[];
  dailyAnalysisCount?: number;
  lastAnalysisDate?: string;
  estimatedGains?: number;
  estimatedLosses?: number;
}

export const getUsers = (): User[] => {
  const users = localStorage.getItem('vital_users');
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem('vital_users', JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('vital_current_user');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('vital_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('vital_current_user');
  }
};

export const generateUserId = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `CLT-${random}`;
};
