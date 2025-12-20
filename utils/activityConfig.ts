// utils/activityConfig.ts

export const activityConfig = {
  running: {
    icon: "walk",
    label: "Course à pied",
    color: "#ff6b6b",
    emoji: "🏃",
    fields: ["distance", "duration", "elevationGain"], // ⭐ avgSpeed retiré
  },
  cycling: {
    icon: "bicycle-outline",
    label: "Vélo",
    color: "#51cf66",
    emoji: "🚴",
    fields: ["distance", "duration", "elevationGain"], // ⭐ avgSpeed retiré
  },
  walking: {
    icon: "walk-outline",
    label: "Marche",
    color: "#4dabf7",
    emoji: "🚶",
    fields: ["distance", "duration"],
  },
  swimming: {
    icon: "water-outline",
    label: "Natation",
    color: "#339af0",
    emoji: "🏊",
    fields: ["distance", "duration", "poolLength", "laps"], // ⭐ Ordre ajusté
  },
  workout: {
    icon: "barbell-outline",
    label: "Musculation",
    color: "#ff922b",
    emoji: "💪",
    fields: ["duration", "exercises"], // ⭐ Ordre ajusté
  },
  yoga: {
    icon: "leaf-outline",
    label: "Yoga",
    color: "#a78bfa",
    emoji: "🧘",
    fields: ["duration"],
  },
} as const;

export type ActivityTypeKey = keyof typeof activityConfig;