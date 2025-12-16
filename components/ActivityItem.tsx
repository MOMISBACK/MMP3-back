
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Activity } from '../types/Activity';
import { Ionicons } from '@expo/vector-icons';
import { getActivityConfig } from '../utils/activityConfig';

interface ActivityItemProps {
  activity: Activity;
  onDelete: (id: string) => void;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onDelete }) => {
  const { icon, label } = getActivityConfig(activity.type);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{label}</Text>
        <Text style={styles.details}>
          {activity.duration} min
          {activity.distance ? ` - ${activity.distance} km` : ''}
          {activity.calories ? ` - ${activity.calories} kcal` : ''}
        </Text>
        <Text style={styles.details}>
          {new Date(activity.date).toLocaleDateString()} {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          if (Platform.OS === 'web') {
            if (confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")) {
              onDelete(activity._id || activity.id);
            }
          } else {
            Alert.alert(
              "Supprimer l'activité",
              "Êtes-vous sûr de vouloir supprimer cette activité ?",
              [
                { text: "Annuler", style: "cancel" },
                { text: "Supprimer", style: "destructive", onPress: () => onDelete(activity._id || activity.id) },
              ]
            );
          }
        }}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={24} color="#ff6b6b" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  icon: {
    fontSize: 24,
    marginRight: 15,
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  details: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 4,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
});
