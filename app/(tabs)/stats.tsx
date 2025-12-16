
import { Picker } from "@react-native-picker/picker";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useActivities } from "../../context/ActivityContext";
import { statsProcessor, GlobalStats } from "../../services/statsProcessor";
import { ActivityTypeKey, getActivityConfig } from "../../utils/activityConfig";

type Period = "semaine" | "mois" | "annee";

const BarChart = ({
  data,
  title,
  unit,
}: {
  data: Record<ActivityTypeKey, number>;
  title: string;
  unit: string;
}) => {
  const maxValue = Math.max(...Object.values(data));
  const entries = Object.entries(data).filter(([, value]) => value > 0);

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      {entries.map(([type, value]) => {
        const config = getActivityConfig(type as ActivityTypeKey);
        return (
          <View key={type} style={styles.barWrapper}>
            <Text style={styles.barLabel}>{config.icon} {config.label}</Text>
            <View style={styles.bar}>
              <View
                style={[
                  styles.barFill,
                  { width: `${(value / (maxValue || 1)) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.barValue}>
              {value.toFixed(1)} {unit}
            </Text>
          </View>
        );
      })}
    </View>
  );
};


export default function StatsScreen() {
  const { activities, loading } = useActivities();
  const [period, setPeriod] = useState<Period>("semaine");

  const filteredActivities = useMemo(() => {
    if (!activities) return [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return activities.filter((activity) => {
      const activityDate = new Date(activity.date);
      if (isNaN(activityDate.getTime())) return false;
      activityDate.setHours(0, 0, 0, 0);

      switch (period) {
        case "semaine": {
          const oneWeekAgo = new Date(now);
          oneWeekAgo.setDate(now.getDate() - 7);
          return activityDate >= oneWeekAgo;
        }
        case "mois": {
          return (
            activityDate.getMonth() === now.getMonth() &&
            activityDate.getFullYear() === now.getFullYear()
          );
        }
        case "annee": {
          return activityDate.getFullYear() === now.getFullYear();
        }
        default:
          return true;
      }
    });
  }, [activities, period]);

  const stats: GlobalStats = useMemo(() => {
    return statsProcessor.calculateGlobalStats(filteredActivities);
  }, [filteredActivities]);

  if (loading) {
    return <View style={styles.container}><Text style={styles.loadingText}>Chargement des statistiques...</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Statistiques</Text>

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Période :</Text>
        <Picker
          selectedValue={period}
          onValueChange={(v) => setPeriod(v as Period)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="Semaine" value="semaine" />
          <Picker.Item label="Mois" value="mois" />
          <Picker.Item label="Année" value="annee" />
        </Picker>
      </View>

      {filteredActivities.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            Aucune activité enregistrée pour cette période 💤
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>Totaux</Text>
            <Text style={styles.cardText}>Activités: {stats.totalActivities}</Text>
            <Text style={styles.cardText}>Durée: {stats.totalDuration.toFixed(2)} min</Text>
            <Text style={styles.cardText}>Distance: {stats.totalDistance.toFixed(2)} km</Text>
            <Text style={styles.cardText}>Calories: {stats.totalCalories.toFixed(2)} kcal</Text>
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>Moyennes par activité</Text>
            <Text style={styles.cardText}>Durée: {stats.averageDuration.toFixed(2)} min</Text>
            <Text style={styles.cardText}>Distance: {stats.averageDistance.toFixed(2)} km</Text>
            <Text style={styles.cardText}>Calories: {stats.averageCalories.toFixed(2)} kcal</Text>
          </View>

          {stats.longestActivity && (
            <View style={styles.statsCard}>
              <Text style={styles.cardTitle}>Activité la plus longue</Text>
              <Text style={styles.cardText}>
                {getActivityConfig(stats.longestActivity.type).label}
              </Text>
              <Text style={styles.cardText}>Durée: {stats.longestActivity.duration} min</Text>
            </View>
          )}

          <BarChart
            data={stats.durationByType}
            title="Durée par type d'activité"
            unit="min"
          />
          <BarChart
            data={stats.distanceByType}
            title="Distance par type d'activité"
            unit="km"
          />
          <BarChart
            data={stats.caloriesByType}
            title="Calories par type d'activité"
            unit="kcal"
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#111",
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    marginTop: 40,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  pickerLabel: {
    color: '#fff',
    fontSize: 16,
  },
  picker: {
    flex: 1,
    color: '#fff',
  },
  pickerItem: {
    color: '#fff',
    backgroundColor: '#1e1e1e'
  },
  statsCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffd700",
    marginBottom: 10,
  },
  cardText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  chartContainer: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffd700",
    marginBottom: 10,
  },
  barWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  barLabel: {
    width: 80,
    color: '#fff',
  },
  bar: {
    flex: 1,
    height: 20,
    backgroundColor: "#333",
    borderRadius: 4,
    marginRight: 8,
  },
  barFill: {
    height: "100%",
    backgroundColor: "#ffd700",
    borderRadius: 4,
  },
  barValue: {
    minWidth: 60,
    textAlign: "right",
    color: '#fff',
  },
  emptyBox: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    alignItems: "center",
    borderRadius: 8,
  },
  emptyText: { color: "#888" },
});
