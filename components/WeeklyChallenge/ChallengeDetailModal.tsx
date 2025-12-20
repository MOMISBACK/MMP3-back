// components/WeeklyChallenge/ChallengeDetailModal.tsx

import { 
  Modal, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useChallenge } from '../../context/ChallengeContext';
import { useActivities } from '../../context/ActivityContext';
import { activityConfig } from '../../utils/activityConfig';
import { activityFormatters } from '../../utils/activityFormatters';
import { ChallengeForm } from './ChallengeForm';
import { theme } from '../../utils/theme';
import { GradientText } from '../GradientText';

interface ChallengeDetailModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ChallengeDetailModal({ visible, onClose }: ChallengeDetailModalProps) {
  const { currentChallenge, deleteChallenge } = useChallenge();
  const { activities } = useActivities();
  const [isEditing, setIsEditing] = useState(false);
  const [challengeActivities, setChallengeActivities] = useState<any[]>([]);

  // ⭐ Filtrer les activités de la semaine qui correspondent au challenge
  useEffect(() => {
    if (currentChallenge && activities) {
      const weekStart = new Date(currentChallenge.startDate);
      const weekEnd = new Date(currentChallenge.endDate);
      
      const filtered = activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return (
          activityDate >= weekStart && 
          activityDate < weekEnd &&
          currentChallenge.activityTypes.includes(activity.type)
        );
      });
      
      setChallengeActivities(filtered);
    }
  }, [currentChallenge, activities]);

  if (!currentChallenge) return null;

  const { title, icon, activityTypes, goalType, goalValue, progress } = currentChallenge;

  const formatGoalValue = (value: number, type: string) => {
    switch (type) {
      case 'distance': return `${value} km`;
      case 'duration': return activityFormatters.formatDuration(value);
      case 'count': return `${value} activité${value > 1 ? 's' : ''}`;
      default: return value.toString();
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le défi',
      'Êtes-vous sûr ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChallenge();
              onClose();
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          }
        }
      ]
    );
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
  };

  // ⭐ Stats calculées des activités du challenge
  const challengeStats = {
    count: challengeActivities.length,
    totalDistance: challengeActivities.reduce((sum, a) => sum + (a.distance || 0), 0),
    totalDuration: challengeActivities.reduce((sum, a) => sum + (a.duration || 0), 0),
    totalElevation: challengeActivities.reduce((sum, a) => sum + (a.elevationGain || 0), 0),
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.container}>
          {/* En-tête */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Modifier le défi' : 'Détails du défi'}
            </Text>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {isEditing ? (
              <ChallengeForm 
                mode="edit" 
                onSuccess={handleEditSuccess}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <>
                {/* Titre + Icône */}
                <View style={styles.titleSection}>
                  <Ionicons name={icon as any} size={48} color={theme.colors.users.primary} />
                  <Text style={styles.title}>{title}</Text>
                </View>

                {/* Types d'activités */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>ACTIVITÉS CONCERNÉES</Text>
                  <View style={styles.typesRow}>
                    {activityTypes.map((type) => (
                      <View key={type} style={styles.typeChip}>
                        <Ionicons 
                          name={activityConfig[type].icon as any} 
                          size={16} 
                          color={theme.colors.text.secondary} 
                        />
                        <Text style={styles.typeText}>
                          {activityConfig[type].label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Objectif */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>OBJECTIF</Text>
                  <Text style={styles.objectiveText}>
                    {formatGoalValue(goalValue, goalType)}
                    {' '}
                    <Text style={styles.objectiveSubtext}>avant dimanche soir</Text>
                  </Text>
                </View>

                {/* Progression */}
                {progress && (
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>PROGRESSION</Text>
                    
                    {/* Barre */}
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={progress.isCompleted ? ['#4caf50', '#45a049'] : theme.gradients.countdown}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressFill, { 
                          width: `${Math.min(progress.percentage, 100)}%`
                        }]} 
                      />
                    </View>

                    {/* Stats */}
                    <View style={styles.progressRow}>
                      <Text style={styles.progressText}>
                        {formatGoalValue(progress.current, goalType)}
                      </Text>
                      <GradientText
                        colors={progress.isCompleted ? ['#4caf50', '#45a049'] : theme.gradients.countdown}
                        style={styles.progressPercent}
                      >
                        {progress.percentage.toFixed(0)}%
                      </GradientText>
                    </View>

                    {progress.isCompleted && (
                      <LinearGradient
                        colors={[`${theme.colors.users.victory}20`, `${theme.colors.users.victory}10`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.completedBanner}
                      >
                        <Ionicons name="trophy" size={24} color={theme.colors.users.victory} />
                        <Text style={styles.completedText}>Défi réussi !</Text>
                      </LinearGradient>
                    )}
                  </View>
                )}

                {/* ⭐ Stats des activités du challenge */}
                {challengeActivities.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>STATISTIQUES DE LA SEMAINE</Text>
                    
                    <LinearGradient
                      colors={theme.gradients.card}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.statsCard}
                    >
                      <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                          <Ionicons name="list" size={20} color={theme.colors.users.primary} />
                          <Text style={styles.statValue}>{challengeStats.count}</Text>
                          <Text style={styles.statLabel}>Activités</Text>
                        </View>

                        {goalType === 'distance' && (
                          <View style={styles.statItem}>
                            <Ionicons name="navigate" size={20} color={theme.colors.users.primary} />
                            <Text style={styles.statValue}>{challengeStats.totalDistance.toFixed(1)}</Text>
                            <Text style={styles.statLabel}>km</Text>
                          </View>
                        )}

                        {(goalType === 'duration' || challengeStats.totalDuration > 0) && (
                          <View style={styles.statItem}>
                            <Ionicons name="time" size={20} color={theme.colors.users.primary} />
                            <Text style={styles.statValue}>{Math.floor(challengeStats.totalDuration / 60)}</Text>
                            <Text style={styles.statLabel}>heures</Text>
                          </View>
                        )}

                        {challengeStats.totalElevation > 0 && (
                          <View style={styles.statItem}>
                            <Ionicons name="trending-up" size={20} color={theme.colors.users.primary} />
                            <Text style={styles.statValue}>{Math.floor(challengeStats.totalElevation)}</Text>
                            <Text style={styles.statLabel}>m D+</Text>
                          </View>
                        )}
                      </View>
                    </LinearGradient>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Boutons flottants */}
          {!isEditing && (
            <View style={styles.floatingActions}>
              <TouchableOpacity 
                style={styles.floatingButtonLeft}
                onPress={onClose}
              >
                <Ionicons name="arrow-back" size={22} color={theme.colors.text.primary} />
              </TouchableOpacity>

              <View style={styles.floatingActionsRight}>
                <TouchableOpacity 
                  style={styles.floatingButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Ionicons name="pencil-outline" size={22} color={theme.colors.text.secondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.floatingButton}
                  onPress={handleDelete}
                >
                  <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg.primary,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text.primary,
    flex: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 11,
    color: theme.colors.text.muted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.bg.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  typeText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  objectiveText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  objectiveSubtext: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontWeight: '400',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.users.victory,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.users.victory,
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
    minWidth: 70,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
  },
  floatingActions: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  floatingButtonLeft: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.bg.card,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingActionsRight: {
    flexDirection: 'row',
    gap: 12,
  },
  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.bg.card,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});