export type QuestCategory = 'SKINCARE' | 'EDUCATION' | 'PRODUCTIVITY' | 'HEALTH';
export type RepeatType = 'DAILY' | 'SINGLE';

export interface Quest {
  id: number;
  title: string;
  description?: string;
  category: QuestCategory;
  repeatType: RepeatType;
  completed: boolean;
  lastCompleted?: string;
  createdAt: string;
}

export interface CreateQuestRequest {
  title: string;
  description?: string;
  category: QuestCategory;
  repeatType: RepeatType;
}

export interface AuthResponse {
  role: null;
  currentXp: null;
  lvl: null;
  token: string;
  username: string;
}
