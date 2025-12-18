// components/WeeklyChallenge/ChallengeCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useChallenge } from '../../context/ChallengeContext';
import { activityConfig } from '../../utils/activityConfig';
import { activityFormatters } from '../../utils/activityFormatters';

interface ChallengeCardProps {
  onEdit: () => void;
}

export function ChallengeCard({ onEdit }: ChallengeCardProps) {
  const { currentChallenge, deleteChallenge, loading } = useChallenge();

  if (!currentChallenge) return null;

  const { title, icon, activityTypes, goalType, progress } = currentChallenge;

  // Formatage valeur selon type
  const formatGoalValue = (value: number, type: string) => {
    switch (type) {
      case 'distance':
        return `${value} km`;
      case 'duration':
        return activityFormatters.formatDuration(value);
      case 'count':
        return `${value} activité${value > 1 ? 's' : ''}`;
      default:
        return value.toString();
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le défi',
      'Êtes-vous sûr de vouloir abandonner ce défi ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChallenge();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le défi');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
            <Ionicons name="pencil-outline" size={20} color="#aaa" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={20} color="#aaa" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Types d'activités - VERSION SOBRE */}
      <View style={styles.typesRow}>
        {activityTypes.map((type) => {
          const config = activityConfig[type];
          return (
            <Text key={type} style={styles.typeText}>
              {config.label}
            </Text>
          );
        })}
      </View>

      {/* Progression */}
      {progress && (
        <>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(progress.percentage, 100)}%`,
                  backgroundColor: progress.isCompleted ? '#4caf50' : '#ffd700'
                }
              ]} 
            />
          </View>

          <View style={styles.stats}>
            <Text style={styles.progressText}>
              {formatGoalValue(progress.current, goalType)}
              <Text style={styles.progressGoal}> / {formatGoalValue(progress.goal, goalType)}</Text>
            </Text>
            <Text style={[
              styles.percentage,
              progress.isCompleted && styles.percentageCompleted
            ]}>
              {progress.percentage.toFixed(0)}%
            </Text>
          </View>

          {progress.isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
              <Text style={styles.completedText}>Défi réussi !</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeText: {
    fontSize: 12,
    color: '#888',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#252525',
    borderRadius: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
  progressGoal: {
    color: '#888',
    fontWeight: '400',
  },
  percentage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffd700',
  },
  percentageCompleted: {
    color: '#4caf50',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 8,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4caf50',
  },
});