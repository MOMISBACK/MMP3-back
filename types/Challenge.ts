// types/Challenge.ts

import { ActivityTypeKey } from '../utils/activityConfig';

export type ChallengeGoalType = 'distance' | 'duration' | 'count';

export interface WeeklyChallenge {
  _id: string;
  userId: string;
  startDate: string;
  endDate: string;
  activityTypes: ActivityTypeKey[];
  goalType: ChallengeGoalType;
  goalValue: number;
  title: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
  progress?: ChallengeProgress;
}

export interface ChallengeProgress {
  current: number;
  goal: number;
  percentage: number;
  isCompleted: boolean;
  remainingActivities: number;
}

export interface ChallengeSuggestion {
  title: string;
  activityTypes: ActivityTypeKey[];
  goalType: ChallengeGoalType;
  goalValue: number;
  icon: string;
}

export interface CreateChallengeData {
  activityTypes: ActivityTypeKey[];
  goalType: ChallengeGoalType;
  goalValue: number;
  title: string;
  icon?: string;
}