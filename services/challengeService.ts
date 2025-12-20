// services/challengeService.ts

import api from './api';
import type { Challenge, CreateChallengeData, UpdateChallengeData } from '../types/Challenge';

export const challengeService = {
  
  async getCurrentChallenge(): Promise<Challenge | null> {
    try {
      const response = await api.get('/challenges/current');
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async createChallenge(data: CreateChallengeData): Promise<Challenge> {
    try {
      console.log('📤 Création challenge:', JSON.stringify(data, null, 2));
      
      const response = await api.post('/challenges', data);
      
      console.log('✅ Challenge créé:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Erreur création:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Erreur lors de la création');
    }
  },

  async updateChallenge(data: UpdateChallengeData): Promise<Challenge> {
    try {
      console.log('📤 Mise à jour challenge:', JSON.stringify(data, null, 2));
      
      const response = await api.put('/challenges/current', data);
      
      console.log('✅ Challenge mis à jour:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Erreur mise à jour:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  },

  async deleteChallenge(): Promise<void> {
    try {
      await api.delete('/challenges/current');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  },

  async refreshProgress(): Promise<Challenge | null> {
    try {
      console.log('🔄 Rafraîchissement de la progression...');
      const response = await api.post('/challenges/refresh-progress');
      console.log('✅ Progression rafraîchie:', response.data.data?.overallProgress);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};