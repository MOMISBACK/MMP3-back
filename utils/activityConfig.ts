export const activityConfig = {
  running: {
    icon: "run",
    iconFamily: "MaterialCommunityIcons",
    label: "Course à pied",
    fields: ["distance", "elevationGain", "avgSpeed", "duration"],
  },
  cycling: {
    icon: "bicycle-outline",
    label: "Vélo",
    fields: ["distance", "elevationGain", "avgSpeed", "duration"],
  },
  walking: {
    icon: "walk-outline",
    label: "Marche",
    fields: ["distance", "duration"],
  },
  swimming: {
    icon: "water-outline",
    label: "Natation",
    fields: ["distance", "poolLength", "laps", "duration"],
  },
  workout: {
    icon: "barbell-outline",
    label: "Musculation",
    fields: ["exercises", "duration"],
  },

  
} as const;

export type ActivityTypeKey = keyof typeof activityConfig;