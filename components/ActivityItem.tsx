// components/ActivityItem.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity } from '../types/Activity';
import { Ionicons } from '@expo/vector-icons';
import { activityConfig } from '../utils/activityConfig';
import { activityFormatters } from '../utils/activityFormatters';
import { Link } from 'expo-router';
import { theme } from '../utils/theme';
import { useAuth } from '../context/AuthContext';

interface ActivityItemProps {
  activity: Activity;
  onDelete: (id: string) => void;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onDelete }) => {
  const { user } = useAuth();
  const config = activityConfig[activity.type] || { icon: "help-circle-outline", label: "Activité" };
  const activityId = activity._id || activity.id;
  const { date, time } = activityFormatters.formatDateTime(activity.date);

  // Pour l'instant : toutes les activités sont "moi" (cyan)
  // Plus tard : on comparera activity.userId avec user._id
  const isMyActivity = true; // Simulé
  const userColor = isMyActivity ? theme.colors.users.primary : theme.colors.users.secondary;
  const userName = isMyActivity ? (user?.email?.split('@')[0] || 'Moi') : 'Équipier';

  const handleDelete = (e: any) => {
    e.preventDefault();
    
    if (Platform.OS === 'web') {
      if (confirm("Supprimer cette activité ?")) {
        onDelete(activityId);
      }
    } else {
      Alert.alert(
        "Supprimer l'activité",
        "Êtes-vous sûr ?",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Supprimer", style: "destructive", onPress: () => onDelete(activityId) },
        ]
      );
    }
  };

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
        <LinearGradient
          colors={theme.gradients.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.container,
            { borderLeftColor: userColor, borderLeftWidth: 3 }
          ]}
        >
          {/* Icône */}
          <View style={[styles.activityIcon, { backgroundColor: `${userColor}25` }]}>
            <Ionicons 
              name={config.icon as any} 
              size={24} 
              color={userColor} 
            />
          </View>

          {/* Détails */}
          <View style={styles.detailsContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>{activity.title}</Text>
              <View style={[styles.userBadge, { backgroundColor: `${userColor}40` }]}>
                <Text style={[styles.badgeText, { color: userColor }]}>
                  {userName.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={styles.details}>{renderDetails()}</Text>
            <Text style={styles.dateTime}>{date} à {time}</Text>
            
            {activity.exercises && activity.exercises.length > 0 && (
              <Text style={styles.exercises}>
                {activity.exercises.slice(0, 2).map(ex => ex.name).join(', ')}
                {activity.exercises.length > 2 && ` +${activity.exercises.length - 2}`}
              </Text>
            )}
          </View>

          {/* Bouton supprimer */}
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
          </TouchableOpacity>
        </LinearGradient>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 14,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  userBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  details: {
    color: theme.colors.text.secondary,
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  dateTime: {
    color: theme.colors.text.tertiary,
    fontSize: 11,
    marginTop: 4,
  },
  exercises: {
    color: theme.colors.text.tertiary,
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});