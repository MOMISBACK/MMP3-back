// context/ChallengeContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { challengeService } from '../services/challengeService';
import type { Challenge, CreateChallengeData, UpdateChallengeData } from '../types/Challenge';
import { useAuth } from './AuthContext';

interface ChallengeContextType {
  currentChallenge: Challenge | null;
  loading: boolean;
  error: string | null;
  createChallenge: (data: CreateChallengeData) => Promise<void>;
  updateChallenge: (data: UpdateChallengeData) => Promise<void>;
  deleteChallenge: () => Promise<void>;
  refreshChallenge: () => Promise<void>;
  clearError: () => void;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export const ChallengeProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChallenge = async () => {
    if (!isAuthenticated) {
      setCurrentChallenge(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const challenge = await challengeService.getCurrentChallenge();
      setCurrentChallenge(challenge);
    } catch (err: any) {
      console.error('Erreur chargement challenge:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenge();
  }, [isAuthenticated]);

  const createChallenge = async (data: CreateChallengeData) => {
    try {
      setLoading(true);
      const newChallenge = await challengeService.createChallenge(data);
      setCurrentChallenge(newChallenge);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateChallenge = async (data: UpdateChallengeData) => {
    try {
      setLoading(true);
      const updated = await challengeService.updateChallenge(data);
      setCurrentChallenge(updated);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteChallenge = async () => {
    try {
      setLoading(true);
      await challengeService.deleteChallenge();
      setCurrentChallenge(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshChallenge = async () => {
    try {
      const refreshed = await challengeService.refreshProgress();
      setCurrentChallenge(refreshed);
    } catch (err: any) {
      console.error('Erreur refresh:', err);
    }
  };

  const clearError = () => setError(null);

  return (
    <ChallengeContext.Provider
      value={{
        currentChallenge,
        loading,
        error,
        createChallenge,
        updateChallenge,
        deleteChallenge,
        refreshChallenge,
        clearError,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallenge = () => {
  const context = useContext(ChallengeContext);
  if (!context) {
    throw new Error('useChallenge must be used within ChallengeProvider');
  }
  return context;
};