export interface Activity {
  _id?: string; // From MongoDB
  id: string;
  type: "course" | "velo" | "natation" | "marche";
  duration: number; // in minutes
  distance?: number; // in km
  calories?: number;
  date: string; // ISO 8601
}