import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Pressable } from 'react-native';
import { Activity } from '../types/Activity';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';  // ⬅️ AJOUTE MaterialCommunityIcons
import { activityConfig } from '../utils/activityConfig';
import { activityFormatters } from '../utils/activityFormatters';
import { Link } from 'expo-router';


interface ActivityItemProps {
  activity: Activity;
  onDelete: (id: string) => void;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onDelete }) => {
  const config = activityConfig[activity.type] || { icon: "⚪", label: "Activité" };
  const activityId = activity._id || activity.id;
  const { date, time } = activityFormatters.formatDateTime(activity.date);

  const handleDelete = (e: any) => {
    e.preventDefault(); // Empêche la navigation
    
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
  };

  // Construction des détails à afficher
  const renderDetails = () => {
    const details: string[] = [activityFormatters.formatDuration(activity.duration)];
    
    if (activity.distance) {
      details.push(activityFormatters.formatDistance(activity.distance));
    }
    
    if (activity.elevationGain) {
      details.push(activityFormatters.formatElevation(activity.elevationGain));
    }
    
    if (activity.avgSpeed) {
      details.push(activityFormatters.formatSpeed(activity.avgSpeed));
    }
    
    if (activity.exercises && activity.exercises.length > 0) {
      details.push(`${activity.exercises.length} exercice${activity.exercises.length > 1 ? 's' : ''}`);
    }
    
    if (activity.laps) {
      details.push(`${activity.laps} longueurs`);
    }

    return details.join(' • ');
  };

  return (
    <Link href={`/activities/${activityId}`} asChild>
      <Pressable>
        <View style={styles.container}>
        {config.iconFamily === 'MaterialCommunityIcons' ? (
          <MaterialCommunityIcons name={config.icon as any} size={28} color="#ffd700" style={styles.icon} />
        ) : (
          <Ionicons name={config.icon as any} size={28} color="#ffd700" style={styles.icon} />
        )}
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{activity.title}</Text>
            <Text style={styles.details}>
              {renderDetails()}
            </Text>
            <Text style={styles.dateTime}>
              {date} à {time}
            </Text>
            {activity.exercises && activity.exercises.length > 0 && (
              <Text style={styles.exercises}>
                {activity.exercises.slice(0, 2).map(ex => ex.name).join(', ')}
                {activity.exercises.length > 2 && ` +${activity.exercises.length - 2}`}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleDelete}
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
    marginRight: 15,
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  details: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 2,
  },
  dateTime: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
  },
  exercises: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
});