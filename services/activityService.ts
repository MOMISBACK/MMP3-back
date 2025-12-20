// services/activityService.ts

import api from "./api";
import { Activity } from "../types/Activity";
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
      // The backend now handles data cleaning and validation.
      // We can send the form data directly.
      const response = await api.post("/activities", activityData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to add activity", error);
      // Re-throw the original error to be handled by the context/UI layer
      throw error;
    }
  },

  deleteActivity: async (id: string, token: string): Promise<void> => {
    try {
      await api.delete(`/activities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ ACTIVITÉ SUPPRIMÉE:", id);
    } catch (error) {
      console.error("❌ Failed to delete activity", error);
      throw error;
    }
  },
};