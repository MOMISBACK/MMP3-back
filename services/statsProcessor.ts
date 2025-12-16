import { Activity } from "../types/Activity";
import { activityConfig, ActivityTypeKey } from "../utils/activityConfig";

export interface GlobalStats {
  totalActivities: number;
  totalDuration: number;
  totalDistance: number;
  totalCalories: number;
  averageDuration: number;
  averageDistance: number;
  averageCalories: number;
  longestActivity?: Activity;
  durationByType: Record<ActivityTypeKey, number>;
  distanceByType: Record<ActivityTypeKey, number>;
  caloriesByType: Record<ActivityTypeKey, number>;
}

export const statsProcessor = {
  calculateGlobalStats: (activities: Activity[]): GlobalStats => {
    const initialStats = {
      totalActivities: 0,
      totalDuration: 0,
      totalDistance: 0,
      totalCalories: 0,
      longestActivity: undefined as Activity | undefined,
      durationByType: {} as Record<ActivityTypeKey, number>,
      distanceByType: {} as Record<ActivityTypeKey, number>,
      caloriesByType: {} as Record<ActivityTypeKey, number>,
    };

    for (const key in activityConfig) {
      initialStats.durationByType[key as ActivityTypeKey] = 0;
      initialStats.distanceByType[key as ActivityTypeKey] = 0;
      initialStats.caloriesByType[key as ActivityTypeKey] = 0;
    }

    if (!activities || activities.length === 0) {
      return { ...initialStats, averageDuration: 0, averageDistance: 0, averageCalories: 0 };
    }

    const totals = activities.reduce((acc, activity) => {
      const config = activityConfig[activity.type];
      if (!config) return acc;

      if (config.fields.includes("duration")) {
        acc.totalDuration += activity.duration || 0;
        acc.durationByType[activity.type] += activity.duration || 0;
      }
      if (config.fields.includes("distance")) {
        acc.totalDistance += activity.distance || 0;
        acc.distanceByType[activity.type] += activity.distance || 0;
      }
      if (config.fields.includes("calories")) {
        acc.totalCalories += activity.calories || 0;
        acc.caloriesByType[activity.type] += activity.calories || 0;
      }

      if (!acc.longestActivity || (activity.duration || 0) > (acc.longestActivity.duration || 0)) {
        acc.longestActivity = activity;
      }

      return acc;
    }, initialStats);

    const totalActivities = activities.length;
    const distanceActivitiesCount = activities.filter(a => activityConfig[a.type]?.fields.includes("distance")).length;

    return {
      ...totals,
      totalActivities,
      averageDuration: totalActivities > 0 ? totals.totalDuration / totalActivities : 0,
      averageDistance: distanceActivitiesCount > 0 ? totals.totalDistance / distanceActivitiesCount : 0,
      averageCalories: totalActivities > 0 ? totals.totalCalories / totalActivities : 0,
    };
  },
};
