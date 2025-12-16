export const activityConfig = {
  running: {
    label: "Course à pied",
    icon: "🏃",
    fields: ["duration", "distance", "elevationGain"],
  },
  walking: {
    label: "Marche",
    icon: "🚶",
    fields: ["duration", "distance", "elevationGain"],
  },
  cycling: {
    label: "Vélo",
    icon: "🚴",
    fields: ["duration", "distance", "elevationGain"],
  },
  swimming: {
    label: "Natation",
    icon: "🏊",
    fields: ["duration", "distance"],
  },
  workout: {
    label: "Musculation",
    icon: "🏋️",
    fields: ["duration", "exercises"],
  },
  yoga: {
    label: "Yoga",
    icon: "🧘",
    fields: ["duration"],
  },
} as const;

export type ActivityTypeKey = keyof typeof activityConfig;

export const activityTypes = Object.entries(activityConfig).map(
  ([key, value]) => ({
    key: key as ActivityTypeKey,
    ...value,
  }),
);
