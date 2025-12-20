// services/activityService.ts

import api from "./api";
import { Activity } from "../types/Activity";
import { activityConfig } from "../utils/activityConfig";
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
      const startTime = new Date(activityData.date);
      const endTime = new Date(startTime.getTime() + activityData.duration * 60000);

      // ⭐ Payload de base (champs toujours requis)
      const backendPayload: any = {
        user: activityData.userId,  // ⭐ CHANGÉ : user au lieu de userId
        title: activityData.title,
        type: activityData.type,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        date: startTime.toISOString(),
        duration: activityData.duration,
        source: activityData.source || "manual",
      };

      // Ajouter les notes si présentes
      if (activityData.notes) {
        backendPayload.notes = activityData.notes;
      }

      // ⭐ Récupérer les champs autorisés pour ce type
      const allowedFields = activityConfig[activityData.type]?.fields || [];
      
      console.log('🔍 Type:', activityData.type);
      console.log('🔍 Champs autorisés (config):', allowedFields);

      // ⭐ Ajouter uniquement les champs spécifiques autorisés
      allowedFields.forEach((field) => {
        if (field === 'duration') return; // Déjà ajouté dans le payload de base
        
        if (activityData[field] !== undefined && activityData[field] !== null) {
          backendPayload[field] = activityData[field];
          console.log(`✅ Ajout champ ${field}:`, activityData[field]);
        }
      });

      console.log("📤 PAYLOAD ENVOYÉ:", JSON.stringify(backendPayload, null, 2));

      const response = await api.post("/activities", backendPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("✅ ACTIVITÉ ENREGISTRÉE:", response.data);
      return response.data;

    } catch (error) {
      const axiosError = error as AxiosError<any>;
      
      // Log complet de l'erreur
      console.error("❌ ERREUR COMPLÈTE:", {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message
      });

      // Extraire le message d'erreur
      let errorMessage = "Une erreur est survenue";
      
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
          
          // Ajouter les détails des champs invalides
          if (errorData.invalidFields) {
            errorMessage += ` (Champs rejetés: ${errorData.invalidFields.join(', ')})`;
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.errors) {
          if (Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.join(', ');
          } else if (typeof errorData.errors === 'object') {
            errorMessage = Object.values(errorData.errors)
              .map((err: any) => err.message || err)
              .join(', ');
          }
        }
      }

      throw new Error(`Échec de l'enregistrement de l'activité: ${errorMessage}`);
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