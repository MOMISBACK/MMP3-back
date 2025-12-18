// components/WeeklyChallenge/ChallengeForm.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useChallenge } from '../../context/ChallengeContext';
import { activityConfig, ActivityTypeKey } from '../../utils/activityConfig';
import { CreateChallengeData, ChallengeGoalType } from '../../types/Challenge';

interface ChallengeFormProps {
  onClose: () => void;
  editMode?: boolean;
}

const GOAL_TYPES = [
  { value: 'distance', label: 'Distance totale (km)', icon: 'map-outline' },
  { value: 'duration', label: 'Temps total (min)', icon: 'time-outline' },
  { value: 'count', label: "Nombre d'activités", icon: 'list-outline' },
] as const;

// ⭐ REMPLACEMENT : Icônes sobres au lieu d'emojis
const CHALLENGE_ICONS = [
  { name: 'trophy-outline', family: 'Ionicons' },
  { name: 'flag-outline', family: 'Ionicons' },
  { name: 'star-outline', family: 'Ionicons' },
  { name: 'medal-outline', family: 'Ionicons' },
  { name: 'fitness-outline', family: 'Ionicons' },
  { name: 'flash-outline', family: 'Ionicons' },
  { name: 'rocket-outline', family: 'Ionicons' },
  { name: 'flame-outline', family: 'Ionicons' },
];

export function ChallengeForm({ onClose, editMode = false }: ChallengeFormProps) {
  const { 
    currentChallenge, 
    suggestions, 
    createChallenge, 
    updateChallenge, 
    loadSuggestions,
    loading 
  } = useChallenge();

  const [title, setTitle] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<ActivityTypeKey[]>([]);
  const [goalType, setGoalType] = useState<ChallengeGoalType>('count');
  const [goalValue, setGoalValue] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(CHALLENGE_ICONS[0]); // ⭐ CHANGÉ
  const [showSuggestions, setShowSuggestions] = useState(!editMode);

  useEffect(() => {
    if (!editMode) {
      loadSuggestions();
    }
  }, []);

  useEffect(() => {
    if (editMode && currentChallenge) {
      setTitle(currentChallenge.title);
      setSelectedTypes(currentChallenge.activityTypes);
      setGoalType(currentChallenge.goalType);
      setGoalValue(currentChallenge.goalValue.toString());
      // Trouver l'icône correspondante ou utiliser la première
      const iconMatch = CHALLENGE_ICONS.find(i => i.name === currentChallenge.icon);
      setSelectedIcon(iconMatch || CHALLENGE_ICONS[0]);
      setShowSuggestions(false);
    }
  }, [editMode, currentChallenge]);

  const toggleActivityType = (type: ActivityTypeKey) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const applySuggestion = (suggestion: any) => {
    setTitle(suggestion.title);
    setSelectedTypes(suggestion.activityTypes);
    setGoalType(suggestion.goalType);
    setGoalValue(suggestion.goalValue.toString());
    setSelectedIcon(CHALLENGE_ICONS[0]); // Icône par défaut
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre');
      return;
    }

    if (selectedTypes.length === 0) {
      Alert.alert('Erreur', 'Sélectionnez au moins une activité');
      return;
    }

    const value = parseFloat(goalValue);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Erreur', 'Objectif invalide');
      return;
    }

    const data: CreateChallengeData = {
      title: title.trim(),
      activityTypes: selectedTypes,
      goalType,
      goalValue: value,
      icon: selectedIcon.name, // ⭐ Enregistre le nom de l'icône
    };

    try {
      if (editMode) {
        await updateChallenge(data);
      } else {
        await createChallenge(data);
      }
      onClose();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.error || 'Une erreur est survenue');
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggestions personnalisées</Text>
          {suggestions.map((sug, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionCard}
              onPress={() => applySuggestion(sug)}
            >
              <View style={styles.suggestionIcon}>
                <Ionicons name="bulb-outline" size={24} color="#ffd700" />
              </View>
              <Text style={styles.suggestionTitle}>{sug.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.customBtn}
            onPress={() => setShowSuggestions(false)}
          >
            <Text style={styles.customBtnText}>Créer un défi personnalisé</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Formulaire */}
      {!showSuggestions && (
        <>
          {/* ⭐ NOUVELLE VERSION : Icônes sobres */}
          <View style={styles.section}>
            <Text style={styles.label}>Icône</Text>
            <View style={styles.iconGrid}>
              {CHALLENGE_ICONS.map((icon) => {
                const isSelected = selectedIcon.name === icon.name;
                const IconComponent = icon.family === 'MaterialCommunityIcons'
                  ? MaterialCommunityIcons
                  : Ionicons;
                
                return (
                  <TouchableOpacity
                    key={icon.name}
                    style={[
                      styles.iconBtn,
                      isSelected && styles.iconBtnSelected,
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <IconComponent 
                      name={icon.name as any} 
                      size={24} 
                      color={isSelected ? '#ffd700' : '#aaa'} 
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Titre */}
          <View style={styles.section}>
            <Text style={styles.label}>Titre du défi</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: 50 km cette semaine"
              placeholderTextColor="#666"
              maxLength={100}
            />
          </View>

          {/* Types d'activités */}
          <View style={styles.section}>
            <Text style={styles.label}>Types d'activités</Text>
            <View style={styles.typesGrid}>
              {(Object.keys(activityConfig) as ActivityTypeKey[]).map((type) => {
                const config = activityConfig[type];
                const isSelected = selectedTypes.includes(type);
                const IconComponent =
                  config.iconFamily === 'MaterialCommunityIcons'
                    ? MaterialCommunityIcons
                    : Ionicons;

                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeCard,
                      isSelected && styles.typeCardSelected,
                    ]}
                    onPress={() => toggleActivityType(type)}
                  >
                    <IconComponent
                      name={config.icon as any}
                      size={28}
                      color={isSelected ? '#ffd700' : '#aaa'}
                    />
                    <Text
                      style={[
                        styles.typeLabel,
                        isSelected && styles.typeLabelSelected,
                      ]}
                    >
                      {config.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark-circle" size={20} color="#ffd700" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Type d'objectif */}
          <View style={styles.section}>
            <Text style={styles.label}>Type d'objectif</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={goalType}
                onValueChange={(value) => setGoalType(value as ChallengeGoalType)}
                style={styles.picker}
                dropdownIconColor="#ffd700"
              >
                {GOAL_TYPES.map((type) => (
                  <Picker.Item
                    key={type.value}
                    label={type.label}
                    value={type.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Valeur objectif */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Objectif{' '}
              {goalType === 'distance' && '(km)'}
              {goalType === 'duration' && '(minutes)'}
            </Text>
            <TextInput
              style={styles.input}
              value={goalValue}
              onChangeText={setGoalValue}
              placeholder="Ex: 50"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>

          {/* Boutons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={onClose}
            >
              <Text style={styles.btnSecondaryText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.btnPrimaryText}>
                {editMode ? 'Modifier' : 'Créer'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
  },
  pickerContainer: {
    backgroundColor: '#333',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  picker: {
    color: '#fff',
  },
  // ⭐ STYLES ICÔNES SOBRES
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconBtn: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconBtnSelected: {
    borderColor: '#ffd700',
    backgroundColor: '#444',
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '47%',
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  typeCardSelected: {
    borderColor: '#ffd700',
    backgroundColor: '#444',
  },
  typeLabel: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 8,
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionTitle: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  customBtn: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  customBtnText: {
    fontSize: 15,
    color: '#ffd700',
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  btn: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: '#ffd700',
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#aaa',
  },
  btnDisabled: {
    opacity: 0.5,
  },
});