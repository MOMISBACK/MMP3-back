import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Activity } from "../../types/Activity";
import { useActivities } from "../../context/ActivityContext";
import { activityConfig } from "../../utils/activityConfig";
import { activityFormatters } from "../../utils/activityFormatters";
import { useActivityForm } from "../../hooks/useActivityForm";
import { DateTimeSelector } from "./DateTimeSelector";
import { ExerciseList } from "./ExerciseList";

interface ActivityFormProps {
  onClose: () => void;
}

/**
 * Formulaire d'ajout d'activité manuelle
 * Utilise une architecture modulaire avec hooks et sous-composants
 */
export const ActivityForm: React.FC<ActivityFormProps> = ({ onClose }) => {
  const { addActivity } = useActivities();
  
  const {
    isSubmitting,
    setIsSubmitting,
    type,
    setType,
    title,
    setTitle,
    hours,
    setHours,
    minutes,
    setMinutes,
    distance,
    setDistance,
    elevation,
    setElevation,
    activityDate,
    exercises,
    updateActivityDate,
    updateActivityTime,
    addExercise,
    removeExercise,
    updateExercise,
    resetForm,
    isFormValid,
  } = useActivityForm();

  const handleSubmit = async () => {
    if (!isFormValid() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const config = activityConfig[type];
      const totalDuration = parseInt(hours) * 60 + parseInt(minutes);
      
      const activityData: Partial<Activity> = {
        title,
        type,
        source: 'manual',
        duration: totalDuration,
        date: activityDate.toISOString(),
      };

      // Champs conditionnels basés sur le type d'activité
      if (config.fields.includes("distance") && distance) {
        activityData.distance = parseFloat(distance);
      }

      if (config.fields.includes("elevationGain") && elevation) {
        activityData.elevationGain = parseInt(elevation, 10);
      }

      if (config.fields.includes("exercises")) {
        activityData.exercises = exercises
          .filter((ex) => ex.name.trim())
          .map((ex) => ({
            name: ex.name,
            sets: ex.sets ? parseInt(ex.sets, 10) : undefined,
            reps: ex.reps ? parseInt(ex.reps, 10) : undefined,
            weight: ex.weight ? parseFloat(ex.weight) : undefined,
          }));
      }

      await addActivity(activityData as Omit<Activity, "id">);
      resetForm();
    } catch (error) {
      console.error("Failed to add activity:", error);
      // TODO: Ajouter un toast/notification d'erreur
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  /**
   * Affiche les champs dynamiques en fonction du type d'activité
   */
  const renderDynamicFields = () => {
    const fields = activityConfig[type].fields;
    
    return (
      <>
        {fields.includes("distance") && (
          <TextInput
            style={styles.input}
            placeholder="Distance (km)"
            placeholderTextColor="#888"
            value={distance}
            onChangeText={setDistance}
            keyboardType="numeric"
          />
        )}
        
        {fields.includes("elevationGain") && (
          <TextInput
            style={styles.input}
            placeholder="Dénivelé (m)"
            placeholderTextColor="#888"
            value={elevation}
            onChangeText={setElevation}
            keyboardType="numeric"
          />
        )}
        
        {fields.includes("exercises") && (
          <ExerciseList
            exercises={exercises}
            onExerciseChange={updateExercise}
            onAddExercise={addExercise}
            onRemoveExercise={removeExercise}
          />
        )}
      </>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        style={styles.input}
        placeholder="Titre de l'activité"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
      />

      <DateTimeSelector
        value={activityDate}
        onDateChange={updateActivityDate}
        onTimeChange={updateActivityTime}
      />

      <View
        style={[
          styles.pickerContainer,
          Platform.OS === "web" && styles.pickerContainerWeb,
        ]}
      >
        <Picker
          selectedValue={type}
          onValueChange={setType}
          style={Platform.OS === "web" ? styles.pickerWeb : styles.picker}
          itemStyle={styles.pickerItem}
        >
          {Object.entries(activityConfig).map(([key, config]) => (
            <Picker.Item
              key={key}
              label={config.label}
              value={key}
            />
          ))}
        </Picker>
      </View>

      {/* Sélecteurs d'heures et minutes */}
      <View style={styles.durationContainer}>
        <Text style={styles.durationLabel}>Durée</Text>
        <View style={styles.durationPickers}>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={hours}
              onValueChange={setHours}
              style={styles.durationPicker}
              itemStyle={styles.pickerItem}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <Picker.Item key={i} label={`${i}h`} value={i.toString()} />
              ))}
            </Picker>
          </View>
          
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={minutes}
              onValueChange={setMinutes}
              style={styles.durationPicker}
              itemStyle={styles.pickerItem}
            >
              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                <Picker.Item key={m} label={`${m}min`} value={m.toString()} />
              ))}
            </Picker>
          </View>
        </View>
        
        {/* Aperçu du temps total */}
        {(parseInt(hours) > 0 || parseInt(minutes) > 0) && (
          <Text style={styles.durationPreview}>
            Total : {activityFormatters.formatDuration(parseInt(hours) * 60 + parseInt(minutes))}
          </Text>
        )}
      </View>

      {renderDynamicFields()}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.buttonContainer, styles.cancelButton]}
          onPress={onClose}
          disabled={isSubmitting}
        >
          <Text style={[styles.buttonText, styles.cancelButtonText]}>
            ANNULER
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.buttonContainer,
            isSubmitting && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || !isFormValid()}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#111" />
          ) : (
            <Text style={styles.buttonText}>AJOUTER</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    paddingBottom: 20,
  },
  input: {
    height: 50,
    backgroundColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 16,
    color: "#fff",
    marginBottom: 16,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "#333",
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: "center",
  },
  pickerContainerWeb: {
    height: 50,
  },
  picker: {
    color: "#fff",
  },
  pickerWeb: {
    height: "100%",
    backgroundColor: "transparent",
    borderWidth: 0,
    color: "#fff",
  },
  pickerItem: {
    color: "#fff",
    backgroundColor: "#333",
  },
  durationContainer: {
    marginBottom: 16,
  },
  durationLabel: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 8,
  },
  durationPickers: {
    flexDirection: "row",
    gap: 12,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: "#333",
    borderRadius: 8,
    overflow: "hidden",
  },
  durationPicker: {
    color: "#fff",
    backgroundColor: "#333",
  },
  durationPreview: {
    color: "#ffd700",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    fontStyle: "italic",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  buttonContainer: {
    backgroundColor: "#ffd700",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#333",
    marginRight: 10,
  },
  buttonDisabled: {
    backgroundColor: '#a5a5a5',
  },
  buttonText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButtonText: {
    color: "#fff",
  },
});