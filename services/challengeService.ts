// services/challengeService.ts

import api from './api';
import { WeeklyChallenge, ChallengeSuggestion, CreateChallengeData } from '../types/Challenge';

export const challengeService = {
  /**
   * Récupère le défi actif avec progression
   */
  getCurrentChallenge: async (token: string): Promise<WeeklyChallenge | null> => {
    try {
      const response = await api.get('/challenges/current', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Récupère les suggestions personnalisées
   */
  getSuggestions: async (token: string): Promise<ChallengeSuggestion[]> => {
    const response = await api.get('/challenges/suggestions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Crée un nouveau défi
   */
  createChallenge: async (data: CreateChallengeData, token: string): Promise<WeeklyChallenge> => {
    const response = await api.post('/challenges', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Modifie le défi actuel
   */
  updateChallenge: async (data: Partial<CreateChallengeData>, token: string): Promise<WeeklyChallenge> => {
    const response = await api.put('/challenges', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Supprime le défi actuel
   */
  deleteChallenge: async (token: string): Promise<void> => {
    await api.delete('/challenges', {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};