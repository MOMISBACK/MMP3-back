export type ActivityTypeKey = "running" | "walking" | "cycling" | "swimming" | "workout" | "yoga";

interface ActivityConfig {
  key: ActivityTypeKey;
  label: string;
  icon: string;
}

export const activityTypes: ActivityConfig[] = [
  { key: "running", label: "Course à pied", icon: "🏃" },
  { key: "walking", label: "Marche", icon: "🚶" },
  { key: "cycling", label: "Vélo", icon: "🚴" },
  { key: "swimming", label: "Natation", icon: "🏊" },
  { key: "workout", label: "Musculation", icon: "🏋️" },
  { key: "yoga", label: "Yoga", icon: "🧘" },
];

const configMap = new Map(activityTypes.map(item => [item.key, item]));

export const getActivityConfig = (key: ActivityTypeKey) => {
  return configMap.get(key) || { key, label: key, icon: "⚪" };
};
