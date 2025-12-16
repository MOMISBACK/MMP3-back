
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Pressable } from 'react-native';
import { Activity } from '../types/Activity';
import { Ionicons } from '@expo/vector-icons';
import { activityConfig } from '../utils/activityConfig';
import { Link } from 'expo-router';

interface ActivityItemProps {
  activity: Activity;
  onDelete: (id: string) => void;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onDelete }) => {
  const config = activityConfig[activity.type] || { icon: "⚪", label: "Activité" };
  const activityId = activity._id || activity.id;

  return (
    <Link href={`/activities/${activityId}`} asChild>
      <Pressable>
        <View style={styles.container}>
          <Text style={styles.icon}>{config.icon}</Text>
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{config.label}</Text>
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
            onPress={(e) => {
              e.preventDefault(); // Prevent navigating when deleting
              if (Platform.OS === 'web') {
                if (confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")) {
                  onDelete(activityId);
                }
              } else {
                Alert.alert(
                  "Supprimer l'activité",
                  "Êtes-vous sûr de vouloir supprimer cette activité ?",
                  [
                    { text: "Annuler", style: "cancel" },
                    { text: "Supprimer", style: "destructive", onPress: () => onDelete(activityId) },
                  ]
                );
              }
            }}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={24} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </Pressable>
    </Link>
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
