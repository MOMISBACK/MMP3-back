import React, { useState } from "react";
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
import { Activity } from "../types/Activity";
import { useActivities } from "../context/ActivityContext";
import { activityConfig, ActivityTypeKey } from "../utils/activityConfig";

interface ActivityFormProps {
  onClose: () => void;
}

type Exercise = {
  name: string;
  sets?: string;
  reps?: string;
  weight?: string;
};

export const ActivityForm: React.FC<ActivityFormProps> = ({ onClose }) => {
  const { addActivity } = useActivities();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<ActivityTypeKey>("running");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [elevation, setElevation] = useState("");

  // State for workout exercises
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "", sets: "", reps: "", weight: "" },
  ]);

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: "", reps: "", weight: "" }]);
  };

  const removeExercise = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
  };

  const handleSubmit = async () => {
    if (!title || !duration || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const config = activityConfig[type];
      const activityData: Partial<Activity> = {
        title,
        type,
        duration: parseInt(duration, 10),
        date: new Date().toISOString(),
      };

      if (config.fields.includes("distance")) {
        activityData.distance = distance ? parseFloat(distance) : undefined;
      }

      if (config.fields.includes("elevationGain")) {
        activityData.elevationGain = elevation ? parseInt(elevation, 10) : undefined;
      }

      if (config.fields.includes("exercises")) {
        activityData.exercises = exercises
          .filter((ex) => ex.name)
          .map((ex) => ({
            name: ex.name,
            sets: ex.sets ? parseInt(ex.sets, 10) : undefined,
            reps: ex.reps ? parseInt(ex.reps, 10) : undefined,
            weight: ex.weight ? parseFloat(ex.weight) : undefined,
          }));
      }

      await addActivity(activityData as Omit<Activity, "id">);
      onClose();
    } catch (error) {
      console.error("Failed to add activity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSpecificFields = () => {
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
          <View>
            <Text style={styles.subHeader}>Exercices</Text>
            {exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={`Exercice ${index + 1}`}
                  placeholderTextColor="#888"
                  value={exercise.name}
                  onChangeText={(value) => handleExerciseChange(index, "name", value)}
                />
                <View style={styles.exerciseRow}>
                  <TextInput
                    style={[styles.input, styles.exerciseInput]}
                    placeholder="Séries"
                    placeholderTextColor="#888"
                    value={exercise.sets}
                    onChangeText={(value) => handleExerciseChange(index, "sets", value)}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.exerciseInput]}
                    placeholder="Rép."
                    placeholderTextColor="#888"
                    value={exercise.reps}
                    onChangeText={(value) => handleExerciseChange(index, "reps", value)}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.exerciseInput]}
                    placeholder="Poids (kg)"
                    placeholderTextColor="#888"
                    value={exercise.weight}
                    onChangeText={(value) => handleExerciseChange(index, "weight", value)}
                    keyboardType="numeric"
                  />
                </View>
                {exercises.length > 1 && (
                  <TouchableOpacity onPress={() => removeExercise(index)} style={styles.removeButton}>
                    <Text style={styles.removeButtonText}>Supprimer</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity onPress={addExercise} style={styles.addButton}>
              <Text style={styles.addButtonText}>Ajouter un exercice</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View
        style={[
          styles.pickerContainer,
          Platform.OS === "web" && styles.pickerContainerWeb,
        ]}
      >
        <Picker
          selectedValue={type}
          onValueChange={(itemValue) => setType(itemValue)}
          style={Platform.OS === "web" ? styles.pickerWeb : styles.picker}
          itemStyle={styles.pickerItem}
        >
          {Object.entries(activityConfig).map(([key, config]) => (
            <Picker.Item
              key={key}
              label={`${config.icon} ${config.label}`}
              value={key}
            />
          ))}
        </Picker>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Titre de l'activité"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Durée (minutes)"
        placeholderTextColor="#888"
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
      />
      {renderSpecificFields()}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.buttonContainer, styles.cancelButton]}
          onPress={onClose}
          disabled={isSubmitting}
        >
          <Text style={[styles.buttonText, styles.cancelButtonText]}>ANNULER</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonContainer, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
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
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  exerciseContainer: {
    marginBottom: 15,
  },
  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  exerciseInput: {
    flex: 1,
    marginRight: 5,
  },
  removeButton: {
    marginTop: 5,
  },
  removeButtonText: {
    color: "#ff4d4d",
    textAlign: "right",
  },
  addButton: {
    backgroundColor: "#444",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
