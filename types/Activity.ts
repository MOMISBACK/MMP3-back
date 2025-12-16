export interface Activity {
  _id?: string;
  id: string;
  type: "course" | "velo" | "natation" | "marche" | "musculation";
  duration: number; // in minutes
  distance?: number; // in km
  calories?: number;
  date: string; // ISO 8601
  exercises?: { name: string; sets?: number; reps?: number; weight?: number }[];
}