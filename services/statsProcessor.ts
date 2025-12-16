import { Activity } from "../types/Activity";

export interface GlobalStats {
  totalActivities: number;
  totalDuration: number; // in minutes
  totalDistance: number; // in km
  totalCalories: number;
  averageDuration: number;
  averageDistance: number;
  averageCalories: number;
  longestActivity?: Activity;
  durationByType: Record<Activity["type"], number>;
  distanceByType: Record<Activity["type"], number>;
  caloriesByType: Record<Activity["type"], number>;
}

export const statsProcessor = {
  calculateGlobalStats: (activities: Activity[]): GlobalStats => {
    const initialTotals = {
      totalActivities: 0,
      totalDuration: 0,
      totalDistance: 0,
      totalCalories: 0,
      longestActivity: undefined as Activity | undefined,
      durationByType: { course: 0, velo: 0, natation: 0, marche: 0 },
      distanceByType: { course: 0, velo: 0, natation: 0, marche: 0 },
      caloriesByType: { course: 0, velo: 0, natation: 0, marche: 0 },
    };

    if (!activities || activities.length === 0) {
      return {
        ...initialTotals,
        averageDuration: 0,
        averageDistance: 0,
        averageCalories: 0,
      };
    }

    const totals = activities.reduce((acc, activity) => {
      acc.totalDuration += activity.duration || 0;
      acc.totalDistance += activity.distance || 0;
      acc.totalCalories += activity.calories || 0;

      if (activity.type in acc.durationByType) {
        acc.durationByType[activity.type] += activity.duration || 0;
        acc.distanceByType[activity.type] += activity.distance || 0;
        acc.caloriesByType[activity.type] += activity.calories || 0;
      }

      if (
        !acc.longestActivity ||
        activity.duration > acc.longestActivity.duration
      ) {
        acc.longestActivity = activity;
      }

      return acc;
    }, initialTotals);

    const totalActivities = activities.length;

    return {
      ...totals,
      totalActivities,
      averageDuration: totals.totalDuration / totalActivities,
      averageDistance: totals.totalDistance / totalActivities,
      averageCalories: totals.totalCalories / totalActivities,
    };
  },
};
