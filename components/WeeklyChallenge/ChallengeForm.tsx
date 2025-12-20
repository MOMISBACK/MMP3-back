// components/WeeklyChallenge/ChallengeForm.tsx

import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  StyleSheet,
  ActivityIndicator 
} from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useChallenge } from '../../context/ChallengeContext';
import { activityConfig, ActivityTypeKey } from '../../utils/activityConfig';
import { theme } from '../../utils/theme';

interface ChallengeFormProps {
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ICONS = [
  'trophy-outline',
  'flag-outline',
  'star-outline',
  'medal-outline',
  'fitness-outline',
  'flash-outline',
  'rocket-outline',
  'flame-outline',
];

export function ChallengeForm({ 
  mode = 'create', 
  onSuccess, 
  onCancel 
}: ChallengeFormProps) {
  const { currentChallenge, createChallenge, updateChallenge } = useChallenge();
  
  const [selectedTypes, setSelectedTypes] = useState<ActivityTypeKey[]>([]);
  
  const [distanceEnabled, setDistanceEnabled] = useState(false);
  const [distanceValue, setDistanceValue] = useState('');
  
  const [durationEnabled, setDurationEnabled] = useState(false);
  const [durationValue, setDurationValue] = useState('');
  
  const [countEnabled, setCountEnabled] = useState(false);
  const [countValue, setCountValue] = useState('');
  
  const [selectedIcon, setSelectedIcon] = useState('trophy-outline');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && currentChallenge) {
      setSelectedTypes(currentChallenge.activityTypes);
      setSelectedIcon(currentChallenge.icon || 'trophy-outline');
      
      // Charger les objectifs existants
      if (currentChallenge.goals) {
        currentChallenge.goals.forEach(goal => {
          if (goal.type === 'distance') {
            setDistanceEnabled(true);
            setDistanceValue(goal.value.toString());
          } else if (goal.type === 'duration') {
            setDurationEnabled(true);
            setDurationValue(goal.value.toString());
          } else if (goal.type === 'count') {
            setCountEnabled(true);
            setCountValue(goal.value.toString());
          }
        });
      }
    }
  }, [mode, currentChallenge]);

  const toggleActivityType = (type: ActivityTypeKey) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const handleSubmit = async () => {
    if (selectedTypes.length === 0) {
      Alert.alert('Erreur', 'Sélectionnez au moins un type d\'activité');
      return;
    }

    const goals = [];
    
    if (distanceEnabled) {
      const val = parseInt(distanceValue);
      if (!val || val <= 0) {
        Alert.alert('Erreur', 'Distance invalide');
        return;
      }
      goals.push({ type: 'distance', value: val });
    }
    
    if (durationEnabled) {
      const val = parseInt(durationValue);
      if (!val || val <= 0) {
        Alert.alert('Erreur', 'Durée invalide');
        return;
      }
      goals.push({ type: 'duration', value: val });
    }
    
    if (countEnabled) {
      const val = parseInt(countValue);
      if (!val || val <= 0) {
        Alert.alert('Erreur', 'Nombre invalide');
        return;
      }
      goals.push({ type: 'count', value: val });
    }

    if (goals.length === 0) {
      Alert.alert('Erreur', 'Activez au moins un objectif');
      return;
    }

    try {
      setLoading(true);
      
      const title = goals.map(g => {
        if (g.type === 'distance') return `${g.value} km`;
        if (g.type === 'duration') {
          const h = Math.floor(g.value / 60);
          const m = g.value % 60;
          return h > 0 ? `${h}h${m}min` : `${m}min`;
        }
        return `${g.value} activité${g.value > 1 ? 's' : ''}`;
      }).join(' + ');

      const data = {
        activityTypes: selectedTypes,
        goals,
        title,
        icon: selectedIcon,
      };

      if (mode === 'edit') {
        await updateChallenge(data);
      } else {
        await createChallenge(data);
      }

      onSuccess?.();
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Types d'activités */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>TYPES D'ACTIVITÉS</Text>
        <View style={styles.typesGrid}>
          {Object.entries(activityConfig).map(([key, config]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.typeButton,
                selectedTypes.includes(key as ActivityTypeKey) && styles.typeButtonActive
              ]}
              onPress={() => toggleActivityType(key as ActivityTypeKey)}
            >
              <Ionicons 
                name={config.icon as any} 
                size={18} 
                color={selectedTypes.includes(key as ActivityTypeKey) 
                  ? theme.colors.text.primary 
                  : theme.colors.text.muted
                } 
              />
              <Text style={[
                styles.typeButtonText,
                selectedTypes.includes(key as ActivityTypeKey) && styles.typeButtonTextActive
              ]}>
                {config.label}
              </Text>
              {selectedTypes.includes(key as ActivityTypeKey) && (
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.users.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Objectifs multiples */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>OBJECTIFS (UN OU PLUSIEURS)</Text>

        {/* Distance */}
        <View style={styles.goalOption}>
          <TouchableOpacity 
            style={styles.goalToggle}
            onPress={() => setDistanceEnabled(!distanceEnabled)}
          >
            <Ionicons 
              name={distanceEnabled ? "checkbox" : "square-outline"} 
              size={24} 
              color={distanceEnabled ? theme.colors.users.primary : theme.colors.text.muted} 
            />
            <Text style={styles.goalLabel}>Distance (km)</Text>
          </TouchableOpacity>
          {distanceEnabled && (
            <TextInput
              style={styles.goalInput}
              value={distanceValue}
              onChangeText={setDistanceValue}
              keyboardType="numeric"
              placeholder="10"
              placeholderTextColor={theme.colors.text.muted}
            />
          )}
        </View>

        {/* Durée */}
        <View style={styles.goalOption}>
          <TouchableOpacity 
            style={styles.goalToggle}
            onPress={() => setDurationEnabled(!durationEnabled)}
          >
            <Ionicons 
              name={durationEnabled ? "checkbox" : "square-outline"} 
              size={24} 
              color={durationEnabled ? theme.colors.users.primary : theme.colors.text.muted} 
            />
            <Text style={styles.goalLabel}>Durée (minutes)</Text>
          </TouchableOpacity>
          {durationEnabled && (
            <TextInput
              style={styles.goalInput}
              value={durationValue}
              onChangeText={setDurationValue}
              keyboardType="numeric"
              placeholder="300"
              placeholderTextColor={theme.colors.text.muted}
            />
          )}
        </View>

        {/* Nombre */}
        <View style={styles.goalOption}>
          <TouchableOpacity 
            style={styles.goalToggle}
            onPress={() => setCountEnabled(!countEnabled)}
          >
            <Ionicons 
              name={countEnabled ? "checkbox" : "square-outline"} 
              size={24} 
              color={countEnabled ? theme.colors.users.primary : theme.colors.text.muted} 
            />
            <Text style={styles.goalLabel}>Nombre d'activités</Text>
          </TouchableOpacity>
          {countEnabled && (
            <TextInput
              style={styles.goalInput}
              value={countValue}
              onChangeText={setCountValue}
              keyboardType="numeric"
              placeholder="3"
              placeholderTextColor={theme.colors.text.muted}
            />
          )}
        </View>
      </View>

      {/* Icône */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ICÔNE</Text>
        <View style={styles.iconsRow}>
          {ICONS.map((icon) => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconButton,
                selectedIcon === icon && styles.iconButtonActive
              ]}
              onPress={() => setSelectedIcon(icon)}
            >
              <Ionicons 
                name={icon as any} 
                size={24} 
                color={selectedIcon === icon ? theme.colors.users.primary : theme.colors.text.muted} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Boutons */}
      <View style={styles.buttonRow}>
        {onCancel && (
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.buttonCancelText}>Annuler</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <LinearGradient
            colors={theme.gradients.countdown}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitGradient}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'edit' ? 'Enregistrer' : 'Créer le défi'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg.primary,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    color: theme.colors.text.muted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  typesGrid: {
    gap: 10,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.bg.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  typeButtonActive: {
    borderColor: theme.colors.users.primary,
    backgroundColor: `${theme.colors.users.primary}10`,
  },
  typeButtonText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.muted,
  },
  typeButtonTextActive: {
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  goalOption: {
    marginBottom: 16,
    gap: 8,
  },
  goalToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalLabel: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  goalInput: {
    backgroundColor: theme.colors.bg.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  iconsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.bg.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  iconButtonActive: {
    borderColor: theme.colors.users.primary,
    backgroundColor: `${theme.colors.users.primary}10`,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: theme.colors.bg.input,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  submitButton: {},
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});