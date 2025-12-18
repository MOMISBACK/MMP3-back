import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react-native';
import { Text, Button } from 'react-native';
import { AuthProvider, useAuth } from './AuthContext';
import * as api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Mock du module d'API ---
jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

// --- Données de test ---
const MOCK_USER = { _id: '1', email: 'test@example.com' };
const MOCK_TOKEN = 'fake-jwt-token';
const MOCK_AUTH_RESPONSE = { ...MOCK_USER, token: MOCK_TOKEN };

// --- Composant "harnais" de test ---
const TestConsumer = () => {
  const { user, token, isAuthenticated, isLoading, login, register, logout } = useAuth();

  // Gère l'erreur attendue pour le test d'échec de connexion
  const handleFailedLogin = () => {
    login('test@example.com', 'password').catch(() => {
      // Erreur attendue, ne rien faire.
    });
  };

  return (
    <>
      <Text testID="user">{user ? user.email : 'null'}</Text>
      <Text testID="token">{token || 'null'}</Text>
      <Text testID="isAuthenticated">{String(isAuthenticated)}</Text>
      <Text testID="isLoading">{String(isLoading)}</Text>
      <Button title="Login" onPress={() => login('test@example.com', 'password')} />
      <Button title="LoginFails" onPress={handleFailedLogin} />
      <Button title="Register" onPress={() => register('new@example.com', 'password')} />
      <Button title="Logout" onPress={() => logout()} />
    </>
  );
};

const renderWithProvider = () => {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
};

describe('AuthContext', () => {

  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('should handle initial loading state correctly', async () => {
    renderWithProvider();
    expect(screen.getByTestId('isLoading').props.children).toBe('true');
    await waitFor(() => {
      expect(screen.getByTestId('isLoading').props.children).toBe('false');
    });
  });

  describe('Login', () => {
    it('should log in, update user and token', async () => {
      mockedApi.login.mockResolvedValue(MOCK_AUTH_RESPONSE);
      mockedApi.getCurrentUser.mockResolvedValue(MOCK_USER);
      renderWithProvider();

      fireEvent.press(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('user').props.children).toBe(MOCK_USER.email);
        expect(screen.getByTestId('isAuthenticated').props.children).toBe('true');
      });
    });

    it('should not update state on failed login', async () => {
      const loginError = new Error('Invalid credentials');
      mockedApi.login.mockRejectedValue(loginError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      renderWithProvider();
      await waitFor(() => expect(screen.getByTestId('isLoading').props.children).toBe('false'));

      fireEvent.press(screen.getByText('LoginFails'));

      await waitFor(() => expect(screen.getByTestId('isLoading').props.children).toBe('true'));
      await waitFor(() => expect(screen.getByTestId('isLoading').props.children).toBe('false'));

      expect(screen.getByTestId('user').props.children).toBe('null');
      expect(screen.getByTestId('isAuthenticated').props.children).toBe('false');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Register', () => {
    it('should register, update user and token', async () => {
      mockedApi.register.mockResolvedValue(MOCK_AUTH_RESPONSE);
      mockedApi.getCurrentUser.mockResolvedValue(MOCK_USER);
      renderWithProvider();

      fireEvent.press(screen.getByText('Register'));

      await waitFor(() => {
        expect(screen.getByTestId('user').props.children).toBe(MOCK_USER.email);
        expect(screen.getByTestId('isAuthenticated').props.children).toBe('true');
      });
    });
  });

  describe('Logout', () => {
    it('should log out and clear user and token', async () => {
      mockedApi.login.mockResolvedValue(MOCK_AUTH_RESPONSE);
      mockedApi.getCurrentUser.mockResolvedValue(MOCK_USER);
      renderWithProvider();
      fireEvent.press(screen.getByText('Login'));

      await waitFor(() => expect(screen.getByTestId('isAuthenticated').props.children).toBe('true'));

      fireEvent.press(screen.getByText('Logout'));

      await waitFor(() => {
        expect(screen.getByTestId('user').props.children).toBe('null');
        expect(screen.getByTestId('isAuthenticated').props.children).toBe('false');
      });
    });
  });
});
