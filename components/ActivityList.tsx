
import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { Activity } from '../types/Activity';
import { ActivityItem } from './ActivityItem';

interface ActivityListProps {
  activities: Activity[];
  onDelete: (id: string) => void;
}

export const ActivityList: React.FC<ActivityListProps> = ({ activities, onDelete }) => {
  if (activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Aucune activité à afficher.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={activities}
      renderItem={({ item }) => <ActivityItem activity={item} onDelete={onDelete} />}
      keyExtractor={(item, index) => item._id || item.id || index.toString()}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  }
});
