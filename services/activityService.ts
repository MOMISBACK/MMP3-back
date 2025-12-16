import api from "./api";
import { Activity } from "../types/Activity";

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
    activityData: Omit<Activity, "id" | "date">,
    token: string,
  ): Promise<Activity> => {
    try {
      console.log("Payload sent:", activityData);
      const response = await api.post("/activities", activityData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to save activity", error);
      throw error;
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
