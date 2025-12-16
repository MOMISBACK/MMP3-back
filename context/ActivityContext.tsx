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
import { useAuth } from "./AuthContext"; // Assuming useAuth provides user/token

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
  const { user, token } = useAuth(); // Get user and token from AuthContext

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
      setActivities([]); // Clear activities on logout
    }
  }, [user, loadActivities]);

  const addActivity = async (activityData: Omit<Activity, "id" | "_id">) => {
    if (!token) {
      setError("Vous devez être connecté pour ajouter une activité.");
      return;
    }

    try {
      const tempId = `temp-${Date.now()}`;
      const newActivity = { ...activityData, id: tempId, date: new Date().toISOString() };
      setActivities((prev) => [newActivity, ...prev]);

      const savedActivity = await activityService.addActivity(activityData, token);

      setActivities((prev) =>
        prev.map((a) => (a.id === tempId ? savedActivity : a)),
      );
    } catch (error) {
      console.error("Failed to save activity", error);
      setError("Impossible d'ajouter l'activité. Veuillez réessayer.");
      await loadActivities();
    }
  };

  const removeActivity = async (id: string) => {
    const originalActivities = [...activities];
    // Optimistic update
    setActivities(prev => prev.filter(a => a.id !== id && a._id !== id));

    if (!token) {
      setError("Vous devez être connecté pour supprimer une activité.");
      setActivities(originalActivities); // Rollback
      return;
    }

    try {
      await activityService.deleteActivity(id, token);
    } catch (error) {
      console.error("Failed to remove activity", error);
      setError("Impossible de supprimer l'activité. Veuillez réessayer.");
      // Rollback
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
