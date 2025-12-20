// context/ActivityContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Activity } from "../types/Activity";
import { activityService } from "../services/activityService";
import { useAuth } from "./AuthContext";
import { useChallenge } from "./ChallengeContext"; // ⭐ AJOUTER

interface ActivityContextType {
  activities: Activity[];
  addActivity: (activityData: Omit<Activity, "id">) => Promise<void>;
  removeActivity: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined,
);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();
  
  // ⭐ AJOUTER - Gestion sécurisée de ChallengeContext
  let refreshChallenge: (() => Promise<void>) | undefined;
  try {
    const challengeContext = useChallenge();
    refreshChallenge = challengeContext.refreshChallenge;
  } catch (error) {
    // ChallengeContext pas encore disponible, on continue sans
    refreshChallenge = undefined;
  }

  const clearError = () => setError(null);

  const loadActivities = useCallback(async () => {
    if (!token) {
      setActivities([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const storedActivities = await activityService.getActivities(token);
      setActivities(storedActivities);
    } catch (error) {
      console.error("Failed to load activities", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      loadActivities();
    } else {
      setActivities([]);
    }
  }, [user, loadActivities]);

  const addActivity = async (activityData: Omit<Activity, "id" | "_id">) => {
    if (!token) {
      setError("Vous devez être connecté pour ajouter une activité.");
      return;
    }

    // Optimistic update: Add activity to state immediately
    const tempId = `temp-${Date.now()}`;
    const newActivity: Activity = {
      ...activityData,
      _id: tempId,
      id: tempId, // Keep both for compatibility
      user: user!._id,
      date: new Date(activityData.date).toISOString(),
    };
    setActivities(prev => [newActivity, ...prev]);

    try {
      // Send data to the server
      const savedActivity = await activityService.addActivity(activityData, token);
      
      // Replace the temporary activity with the real one from the server
      setActivities(prev =>
        prev.map(a => (a._id === tempId ? savedActivity : a))
      );
      
      if (refreshChallenge) {
        await refreshChallenge();
      }
    } catch (error: any) {
      console.error("Failed to save activity", error);
      // Rollback the optimistic update on error
      setActivities(prev => prev.filter(a => a._id !== tempId));

      // Set a more specific error message from the backend response
      const errorMessage = error.response?.data?.message || "Impossible d'ajouter l'activité. Veuillez réessayer.";
      setError(errorMessage);
    }
  };

  const removeActivity = async (id: string) => {
    const originalActivities = [...activities];
    // Optimistic update
    setActivities(prev => prev.filter(a => a.id !== id && a._id !== id));

    if (!token) {
      setError("Vous devez être connecté pour supprimer une activité.");
      setActivities(originalActivities);
      return;
    }

    try {
      await activityService.deleteActivity(id, token);
      
      // ⭐ AJOUTER - Rafraîchir le défi après suppression aussi
      if (refreshChallenge) {
        await refreshChallenge();
      }
    } catch (error) {
      console.error("Failed to remove activity", error);
      setError("Impossible de supprimer l'activité. Veuillez réessayer.");
      setActivities(originalActivities);
    }
  };

  return (
    <ActivityContext.Provider
      value={{ activities, addActivity, removeActivity, loading, error, clearError }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivities() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error("useActivities must be used within an ActivityProvider");
  }
  return context;
}