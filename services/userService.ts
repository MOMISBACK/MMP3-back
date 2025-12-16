import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Type Definitions ---
interface User {
  _id: string;
  email: string;
  createdAt: string;
}

/**
 * Get all registered users
 * @returns {Promise<User[]>} A list of all users
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await api.get<User[]>('/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};
