// context/ChallengeContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { WeeklyChallenge, ChallengeSuggestion, CreateChallengeData } from '../types/Challenge';
import { challengeService } from '../services/challengeService';
import { useAuth } from './AuthContext';

interface ChallengeContextType {
  currentChallenge: WeeklyChallenge | null;
  suggestions: ChallengeSuggestion[];
  loading: boolean;
  error: string | null;
  createChallenge: (data: CreateChallengeData) => Promise<void>;
  updateChallenge: (data: Partial<CreateChallengeData>) => Promise<void>;
  deleteChallenge: () => Promise<void>;
  refreshChallenge: () => Promise<void>;
  loadSuggestions: () => Promise<void>;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export function ChallengeProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [currentChallenge, setCurrentChallenge] = useState<WeeklyChallenge | null>(null);
  const [suggestions, setSuggestions] = useState<ChallengeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ⭐ CORRECTION : Utiliser useCallback pour stabiliser la fonction
  const refreshChallenge = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const challenge = await challengeService.getCurrentChallenge(token);
      setCurrentChallenge(challenge);
    } catch (err: any) {
      console.error('Erreur refreshChallenge:', err);
      setError(err.message || 'Erreur lors du chargement du défi');
    } finally {
      setLoading(false);
    }
  }, [token]); // ⭐ Dépendance : token

  // ⭐ CORRECTION : Utiliser useCallback
  const loadSuggestions = useCallback(async () => {
    if (!token) return;
    
    try {
      const sug = await challengeService.getSuggestions(token);
      setSuggestions(sug);
    } catch (err: any) {
      console.error('Erreur loadSuggestions:', err);
    }
  }, [token]); // ⭐ Dépendance : token

  // ⭐ CORRECTION : Maintenant refreshChallenge est stable
  useEffect(() => {
    if (token && user) {
      refreshChallenge();
    }
  }, [token, user, refreshChallenge]); // ⭐ Dépendances complètes

  // ⭐ CORRECTION : Utiliser useCallback
  const createChallenge = useCallback(async (data: CreateChallengeData) => {
    if (!token) throw new Error('Non authentifié');
    
    try {
      setLoading(true);
      setError(null);
      const newChallenge = await challengeService.createChallenge(data, token);
      setCurrentChallenge(newChallenge);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la création');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]); // ⭐ Dépendance : token

  // ⭐ CORRECTION : Utiliser useCallback
  const updateChallenge = useCallback(async (data: Partial<CreateChallengeData>) => {
    if (!token) throw new Error('Non authentifié');
    
    try {
      setLoading(true);
      setError(null);
      const updated = await challengeService.updateChallenge(data, token);
      setCurrentChallenge(updated);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la modification');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]); // ⭐ Dépendance : token

  // ⭐ CORRECTION : Utiliser useCallback
  const deleteChallenge = useCallback(async () => {
    if (!token) throw new Error('Non authentifié');
    
    try {
      setLoading(true);
      setError(null);
      await challengeService.deleteChallenge(token);
      setCurrentChallenge(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]); // ⭐ Dépendance : token

  return (
    <ChallengeContext.Provider
      value={{
        currentChallenge,
        suggestions,
        loading,
        error,
        createChallenge,
        updateChallenge,
        deleteChallenge,
        refreshChallenge,
        loadSuggestions
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
}

export function useChallenge() {
  const context = useContext(ChallengeContext);
  if (!context) {
    throw new Error('useChallenge doit être utilisé dans ChallengeProvider');
  }
  return context;
}