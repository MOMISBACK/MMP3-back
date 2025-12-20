// types/Challenge.ts

export type ChallengeGoalType = 'distance' | 'duration' | 'count';

export interface ChallengeGoal {
  type: ChallengeGoalType;
  value: number;
}

export interface ChallengeProgress {
  goalType: ChallengeGoalType;
  current: number;
  goal: number;
  percentage: number;
  isCompleted: boolean;
}

export interface OverallProgress {
  completedGoals: number;
  totalGoals: number;
  percentage: number;
  isCompleted: boolean;
}

export interface Challenge {
  _id: string;
  user: string;
  goals: ChallengeGoal[];  // ⭐ Multi-objectifs
  activityTypes: string[];
  title: string;
  icon: string;
  startDate: string;
  endDate: string;
  progress: ChallengeProgress[];  // ⭐ Un par objectif
  overallProgress: OverallProgress;  // ⭐ Global
  createdAt: string;
  updatedAt: string;
}

export interface CreateChallengeData {
  goals: ChallengeGoal[];  // ⭐ Multi-objectifs
  activityTypes: string[];
  title: string;
  icon: string;
}

export interface UpdateChallengeData extends CreateChallengeData {}