export const activityConfig = {
  running: {
    label: "Course à pied",
    icon: "🏃",
    fields: ["duration", "distance", "calories"],
  },
  walking: {
    label: "Marche",
    icon: "🚶",
    fields: ["duration", "distance", "calories"],
  },
  cycling: {
    label: "Vélo",
    icon: "🚴",
    fields: ["duration", "distance", "calories"],
  },
  swimming: {
    label: "Natation",
    icon: "🏊",
    fields: ["duration", "distance", "calories"],
  },
  workout: {
    label: "Musculation",
    icon: "🏋️",
    fields: ["duration", "calories", "exercises"],
  },
  yoga: {
    label: "Yoga",
    icon: "🧘",
    fields: ["duration", "calories"],
  },
} as const;

export type ActivityTypeKey = keyof typeof activityConfig;

export const activityTypes = Object.entries(activityConfig).map(
  ([key, value]) => ({
    key: key as ActivityTypeKey,
    ...value,
  }),
);
