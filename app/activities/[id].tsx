import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useActivities } from "../../context/ActivityContext";
import { activityConfig } from "../../utils/activityConfig";
import { activityFormatters } from "../../utils/activityFormatters";
import { calculateSpeed } from "../../utils/speedCalculator"; // 👈 AJOUT
import { useEffect, useState } from "react";
import { Activity } from "../../types/Activity";

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { activities, removeActivity } = useActivities();
  const [activity, setActivity] = useState<Activity | null>(null);

  useEffect(() => {
    const foundActivity = activities.find(a => a._id === id || a.id === id) || null;
    setActivity(foundActivity);
  }, [id, activities]);

  if (!activity) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <Stack.Screen options={{ title: "Chargement..." }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffd700" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const config = activityConfig[activity.type] || { icon: "help-circle-outline", label: "Activité", fields: [] };
  const { date, time } = activityFormatters.formatDateTime(activity.date);
  
  // 👇 CALCUL DE LA VITESSE
  const speedData = calculateSpeed(activity.distance, activity.duration, activity.type);

  const handleDelete = () => {
    const activityId = activity._id || activity.id;
    removeActivity(activityId);
    router.back();
  };

  const IconComponent = config.iconFamily === 'MaterialCommunityIcons' 
    ? MaterialCommunityIcons 
    : Ionicons;

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Détails",
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <Ionicons name="trash-outline" size={24} color="#ff6b6b" />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.contentContainer}
      >
        {/* Bouton retour */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#aaa" />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>

        {/* Header avec icône et titre */}
        <View style={styles.header}>
          <IconComponent name={config.icon as any} size={56} color="#ffd700" style={styles.icon} />
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={2}>
              {activity.title}
            </Text>
            <Text style={styles.subtitle}>{config.label}</Text>
          </View>
        </View>

        {/* Infos principales */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{date}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Heure</Text>
            <Text style={styles.infoValue}>{time}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Durée</Text>
            <Text style={styles.infoValue}>
              {activityFormatters.formatDuration(activity.duration)}
            </Text>
          </View>
        </View>

        {/* Stats conditionnelles */}
        {(activity.distance || activity.elevationGain || activity.avgSpeed || activity.laps || speedData) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            
            {activity.distance && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Distance</Text>
                <Text style={styles.infoValue}>
                  {activityFormatters.formatDistance(activity.distance)}
                </Text>
              </View>
            )}
            
            {/* 👇 VITESSE/ALLURE CALCULÉE */}
            {speedData && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{speedData.label}</Text>
                <Text style={[styles.infoValue, styles.speedValue]}>
                  {speedData.value}
                </Text>
              </View>
            )}
            
            {activity.elevationGain && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Dénivelé</Text>
                <Text style={styles.infoValue}>
                  {activityFormatters.formatElevation(activity.elevationGain)}
                </Text>
              </View>
            )}
            
            {activity.avgSpeed && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vitesse moy.</Text>
                <Text style={styles.infoValue}>
                  {activityFormatters.formatSpeed(activity.avgSpeed)}
                </Text>
              </View>
            )}
            
            {activity.poolLength && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Bassin</Text>
                <Text style={styles.infoValue}>{activity.poolLength}m</Text>
              </View>
            )}
            
            {activity.laps && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Longueurs</Text>
                <Text style={styles.infoValue}>{activity.laps}</Text>
              </View>
            )}
          </View>
        )}

        {/* Exercices */}
        {activity.exercises && activity.exercises.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exercices</Text>
            {activity.exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseCard}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={styles.exerciseDetailsRow}>
                  {exercise.sets && (
                    <Text style={styles.exerciseDetail}>{exercise.sets} séries</Text>
                  )}
                  {exercise.reps && (
                    <Text style={styles.exerciseDetail}>{exercise.reps} rép.</Text>
                  )}
                  {exercise.weight && (
                    <Text style={styles.exerciseDetail}>{exercise.weight} kg</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Source */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {activity.source === 'manual' ? 'Ajoutée manuellement' : 'Suivie automatiquement'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111",
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 16,
  },
  headerButton: {
    marginRight: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20, 
    marginBottom: 16,
    paddingVertical: 8,
  },
  backText: {
    color: '#aaa',
    fontSize: 16,
    marginLeft: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  icon: {
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#aaa",
  },
  section: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffd700",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  infoLabel: {
    fontSize: 15,
    color: "#aaa",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  speedValue: {
    color: "#ffd700", // 👈 Couleur spéciale pour la vitesse
  },
  exerciseCard: {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 6,
  },
  exerciseDetailsRow: {
    flexDirection: "row",
    gap: 12,
  },
  exerciseDetail: {
    fontSize: 14,
    color: "#aaa",
  },
  footer: {
    alignItems: "center",
    padding: 16,
  },
  footerText: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
  },
});