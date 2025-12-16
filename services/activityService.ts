import api from "./api";
import { Activity } from "../types/Activity";
import { frenchToEnglishActivityType } from "../utils/activityTypeMapping";
import { AxiosError } from "axios";

export const activityService = {
  getActivities: async (token: string): Promise<Activity[]> => {
    try {
      const response = await api.get("/activities", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get activities", error);
      throw error;
    }
  },

  addActivity: async (
    activityData: Omit<Activity, "id" | "_id">,
    token: string,
  ): Promise<Activity> => {
    try {
      const englishType = frenchToEnglishActivityType(activityData.type);

      const startTime = new Date(activityData.date);
      const endTime = new Date(startTime.getTime() + activityData.duration * 60000);

      const backendPayload = {
        type: englishType,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        date: startTime.toISOString(),
        duration: activityData.duration,
        source: 'manual',
        distance: activityData.distance,
      };

      const response = await api.post("/activities", backendPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || "An unknown error occurred";
      console.error("Failed to save activity:", errorMessage);
      if (axiosError.response) {
        console.error("Full error response:", JSON.stringify(axiosError.response.data, null, 2));
      }
      throw new Error(`Échec de l'enregistrement de l'activité: ${errorMessage}`);
    }
  },

  deleteActivity: async (id: string, token: string): Promise<void> => {
    try {
      await api.delete(`/activities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to delete activity", error);
      throw error;
    }
  },
};
