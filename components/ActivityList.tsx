// components/ActivityList.tsx

import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { ActivityItem } from './ActivityItem';
import { Activity } from '../types/Activity';
import { theme } from '../utils/theme';

interface ActivityListProps {
  activities: Activity[];
  onDelete: (id: string) => void;
}

export const ActivityList: React.FC<ActivityListProps> = ({ activities, onDelete }) => {
  if (activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🏃</Text>
        <Text style={styles.emptyText}>Aucune activité</Text>
        <Text style={styles.emptySubtext}>Ajoutez votre première activité</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={activities}
      renderItem={({ item }) => (
        <ActivityItem activity={item} onDelete={onDelete} />
      )}
      keyExtractor={(item) => item._id || item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: theme.colors.text.tertiary,
  },
});