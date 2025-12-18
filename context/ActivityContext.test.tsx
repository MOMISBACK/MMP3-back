import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react-native';
import { Text, Button, View } from 'react-native';
import { ActivityProvider, useActivities } from './ActivityContext';
import { useAuth } from './AuthContext';
import { activityService } from '../services/activityService';
import { Activity } from '../types/Activity';

// --- Mocks ---
jest.mock('./AuthContext');
jest.mock('../services/activityService');
jest.mock('./ChallengeContext', () => ({
  useChallenge: () => ({
    refreshChallenge: jest.fn(),
  }),
}));

const mockedUseAuth = useAuth as jest.Mock;
const mockedActivityService = activityService as jest.Mocked<typeof activityService>;

// --- Données de test ---
const MOCK_USER = { _id: '1', email: 'test@example.com' };
const MOCK_TOKEN = 'fake-jwt-token';
const MOCK_ACTIVITIES: Activity[] = [
  { _id: '101', user: '1', title: 'Morning Run', type: 'running', duration: 30, date: new Date().toISOString() },
  { _id: '102', user: '1', title: 'Gym Session', type: 'workout', duration: 60, date: new Date().toISOString() },
];

// --- Composant "harnais" de test ---
const ActivityTestConsumer = () => {
  const { activities, loading, error, addActivity, removeActivity } = useActivities();

  return (
    <View>
      <Text testID="loading">{String(loading)}</Text>
      <Text testID="error">{error || 'null'}</Text>
      <Text testID="activities-count">{activities.length}</Text>
      {activities.map(act => <Text key={act._id}>{act.title}</Text>)}
      <Button title="Add" onPress={() => addActivity({ title: 'New Walk', type: 'walking', duration: 15, date: new Date().toISOString() })} />
      <Button title="Remove" onPress={() => removeActivity('101')} />
    </View>
  );
};

const renderWithProvider = () => {
  return render(
    <ActivityProvider>
      <ActivityTestConsumer />
    </ActivityProvider>
  );
};


describe('ActivityContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: MOCK_USER,
      token: MOCK_TOKEN,
    });
  });

  it('should load activities on initial render when user is authenticated', async () => {
    mockedActivityService.getActivities.mockResolvedValue(MOCK_ACTIVITIES);

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading').props.children).toBe('false');
      expect(screen.getByTestId('activities-count').props.children).toBe(2);
    });
    expect(mockedActivityService.getActivities).toHaveBeenCalledWith(MOCK_TOKEN);
  });

  it('should not load activities if user is not authenticated', async () => {
    mockedUseAuth.mockReturnValue({ user: null, token: null });

    renderWithProvider();

    await waitFor(() => {
        expect(screen.getByTestId('loading').props.children).toBe('false');
    });
    expect(screen.getByTestId('activities-count').props.children).toBe(0);
    expect(mockedActivityService.getActivities).not.toHaveBeenCalled();
  });

  describe('addActivity', () => {
    it('should add an activity and reload the list', async () => {
      mockedActivityService.getActivities.mockResolvedValueOnce(MOCK_ACTIVITIES);
      renderWithProvider();
      await waitFor(() => expect(screen.getByTestId('activities-count').props.children).toBe(2));

      const newActivity = { _id: '103', user: '1', title: 'New Walk', type: 'walking', duration: 15, date: expect.any(String) };
      mockedActivityService.addActivity.mockResolvedValue(newActivity);
      mockedActivityService.getActivities.mockResolvedValueOnce([...MOCK_ACTIVITIES, newActivity]);

      fireEvent.press(screen.getByText('Add'));

      await waitFor(() => {
        expect(screen.getByTestId('activities-count').props.children).toBe(3);
        expect(screen.getByText('New Walk')).toBeVisible();
      });
    });
  });

  describe('removeActivity', () => {
    it('should optimistically remove an activity and then call the API', async () => {
      mockedActivityService.getActivities.mockResolvedValue(MOCK_ACTIVITIES);
      renderWithProvider();
      await waitFor(() => expect(screen.getByTestId('activities-count').props.children).toBe(2));

      mockedActivityService.deleteActivity.mockResolvedValue(undefined);

      fireEvent.press(screen.getByText('Remove'));

      expect(screen.getByTestId('activities-count').props.children).toBe(1);

      await waitFor(() => {
        expect(mockedActivityService.deleteActivity).toHaveBeenCalledWith('101', MOCK_TOKEN);
      });
    });

    it('should revert the state if the API call fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedActivityService.getActivities.mockResolvedValue(MOCK_ACTIVITIES);
      renderWithProvider();
      await waitFor(() => expect(screen.getByTestId('activities-count').props.children).toBe(2));

      const deleteError = new Error('API Error');
      mockedActivityService.deleteActivity.mockRejectedValue(deleteError);

      fireEvent.press(screen.getByText('Remove'));

      // L'état optimiste est vérifié immédiatement
      expect(screen.getByTestId('activities-count').props.children).toBe(1);

      // On attend la réversion de l'état
      await waitFor(() => {
        expect(screen.getByTestId('activities-count').props.children).toBe(2);
        expect(screen.getByText('Morning Run')).toBeVisible();
      });
      consoleErrorSpy.mockRestore();
    });
  });
});
