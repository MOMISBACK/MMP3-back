import { Stack, useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useActivities } from "../../context/ActivityContext";
import { activityConfig } from "../../utils/activityConfig";
import { useEffect, useState } from "react";
import { Activity } from "../../types/Activity";

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams();
  const { activities } = useActivities();
  const [activity, setActivity] = useState<Activity | null>(null);

  useEffect(() => {
    const foundActivity = activities.find(a => a._id === id || a.id === id) || null;
    setActivity(foundActivity);
  }, [id, activities]);

  if (!activity) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <Text style={styles.text}>Chargement de l'activité...</Text>
      </View>
    );
  }

  const config = activityConfig[activity.type] || { icon: "⚪", label: "Activité", fields: [] };

  const renderSpecificDetails = () => {
    return (
      <>
        {config.fields.includes("distance") && activity.distance && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Distance</Text>
            <Text style={styles.detailValue}>{activity.distance} km</Text>
          </View>
        )}
        {config.fields.includes("elevationGain") && activity.elevationGain && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Dénivelé</Text>
            <Text style={styles.detailValue}>{activity.elevationGain} m</Text>
          </View>
        )}
        {config.fields.includes("exercises") && activity.exercises && (
          <View>
            <Text style={styles.subHeader}>Exercices</Text>
            {activity.exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseContainer}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.sets} séries x {exercise.reps} reps @ {exercise.weight} kg
                </Text>
              </View>
            ))}
          </View>
        )}
      </>
    );
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <Stack.Screen options={{ title: activity.title }} />
      <View style={styles.header}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={styles.title}>{activity.title}</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Durée</Text>
        <Text style={styles.detailValue}>{activity.duration} minutes</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Date</Text>
        <Text style={styles.detailValue}>
          {new Date(activity.date).toLocaleDateString()}
        </Text>
      </View>
      {renderSpecificDetails()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#111",
  },
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  icon: {
    fontSize: 40,
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  detailLabel: {
    color: "#aaa",
    fontSize: 16,
  },
  detailValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    padding: 20,
  },
  exerciseContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  exerciseName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  exerciseDetails: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 4,
  },
  text: {
    color: "#fff",
    fontSize: 18,
  },
});
