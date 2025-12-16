import { ActivityTypeKey } from "../utils/activityConfig";

export interface Activity {
  _id?: string;
  id: string;
  title: string;
  type: ActivityTypeKey;
  duration: number; // in minutes
  distance?: number; // in km
  elevationGain?: number; // D+ en mètres
  date: string; // ISO 8601
  exercises?: { name: string; sets?: number; reps?: number; weight?: number }[];
  startTime?: string;
  endTime?: string;
  source?: 'manual' | 'tracked';
  avgSpeed?: number;
  poolLength?: number;
  laps?: number;
}