export type ActivityTypeKey = "running" | "walking" | "cycling" | "swimming" | "workout" | "yoga";
export type StatCategory = "duration" | "distance" | "calories";

interface ActivityConfig {
  key: ActivityTypeKey;
  label: string;
  icon: string;
  contributesTo: StatCategory[];
}

export const activityTypes: ActivityConfig[] = [
  { key: "running", label: "Course à pied", icon: "🏃", contributesTo: ["duration", "distance", "calories"] },
  { key: "walking", label: "Marche", icon: "🚶", contributesTo: ["duration", "distance", "calories"] },
  { key: "cycling", label: "Vélo", icon: "🚴", contributesTo: ["duration", "distance", "calories"] },
  { key: "swimming", label: "Natation", icon: "🏊", contributesTo: ["duration", "distance", "calories"] },
  { key: "workout", label: "Musculation", icon: "🏋️", contributesTo: ["duration", "calories"] },
  { key: "yoga", label: "Yoga", icon: "🧘", contributesTo: ["duration", "calories"] },
];

const configMap = new Map(activityTypes.map(item => [item.key, item]));

export const getActivityConfig = (key: ActivityTypeKey) => {
  return configMap.get(key) || { key, label: key, icon: "⚪" };
};
