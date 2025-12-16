import { Activity } from "../types/Activity";

export function getActivityLabel(type: Activity["type"]): string {
  const map = {
    course: "Course à pied",
    velo: "Vélo",
    natation: "Natation",
    marche: "Marche",
    musculation: "Musculation",
  };
  return map[type] || "Activité";
}
