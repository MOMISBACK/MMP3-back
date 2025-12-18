import { Picker } from "@react-native-picker/picker";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useActivities } from "../../context/ActivityContext";
import { statsProcessor, GlobalStats } from "../../services/statsProcessor";
import { ActivityTypeKey, activityConfig } from "../../utils/activityConfig";

type Period = "semaine" | "mois" | "annee";

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes.toFixed(0)}min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h${mins > 0 ? mins : ''}`;
};

const StatCard = ({ 
  icon, 
  label, 
  value, 
  unit 
}: { 
  icon: string; 
  label: string; 
  value: string | number; 
  unit?: string;
}) => (
  <View style={styles.statCard}>
    <Ionicons name={icon as any} size={28} color="#ffd700" />
    <Text style={styles.statValue}>
      {value}{unit && <Text style={styles.statUnit}> {unit}</Text>}
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

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
  const entries = Object.entries(data)
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a);

  if (entries.length === 0) return null;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <Ionicons name="bar-chart-outline" size={20} color="#ffd700" />
        <Text style={styles.chartTitle}>{title}</Text>
      </View>
      {entries.map(([type, value]) => {
        const config = activityConfig[type as ActivityTypeKey];
        const IconComponent = config?.iconFamily === 'MaterialCommunityIcons' 
          ? MaterialCommunityIcons 
          : Ionicons;
        
        // Formatage conditionnel selon l'unité
        const displayValue = unit === "min" 
          ? formatDuration(value) 
          : `${value.toFixed(1)} ${unit}`;
        
        return (
          <View key={type} style={styles.barWrapper}>
            <View style={styles.barLabelContainer}>
              <IconComponent 
                name={config?.icon as any} 
                size={18} 
                color="#aaa" 
              />
              <Text style={styles.barLabel}>{config?.label || type}</Text>
            </View>
            <View style={styles.barContainer}>
              <View style={styles.barBackground}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${(value / (maxValue || 1)) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>
                {displayValue}
              </Text>
            </View>
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
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="stats-chart" size={48} color="#ffd700" />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="stats-chart" size={32} color="#ffd700" />
        <Text style={styles.title}>Statistiques</Text>
      </View>

      {/* Sélecteur de période */}
      <View style={styles.pickerContainer}>
        <Ionicons name="calendar-outline" size={20} color="#ffd700" />
        <Picker
          selectedValue={period}
          onValueChange={(v) => setPeriod(v as Period)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="Cette semaine" value="semaine" />
          <Picker.Item label="Ce mois" value="mois" />
          <Picker.Item label="Cette année" value="annee" />
        </Picker>
      </View>

      {filteredActivities.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="moon-outline" size={64} color="#444" />
          <Text style={styles.emptyText}>Aucune activité</Text>
          <Text style={styles.emptySubtext}>pour cette période</Text>
        </View>
      ) : (
        <>
          {/* Stats principales */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="flag-outline"
              label="Activités"
              value={stats.totalActivities}
            />
            <StatCard
              icon="time-outline"
              label="Durée totale"
              value={formatDuration(stats.totalDuration)}
            />
            <StatCard
              icon="speedometer-outline"
              label="Distance totale"
              value={stats.totalDistance.toFixed(1)}
              unit="km"
            />
            <StatCard
              icon="trending-up-outline"
              label="Moy. durée"
              value={formatDuration(stats.averageDuration)}
            />
          </View>

          {/* Activité la plus longue */}
          {stats.longestActivity && (
            <View style={styles.highlightCard}>
              <View style={styles.highlightHeader}>
                <Ionicons name="trophy-outline" size={24} color="#ffd700" />
                <Text style={styles.highlightTitle}>Record de durée</Text>
              </View>
              <View style={styles.highlightContent}>
                <Text style={styles.highlightValue}>
                  {formatDuration(stats.longestActivity.duration)}
                </Text>
                <Text style={styles.highlightLabel}>
                  {activityConfig[stats.longestActivity.type]?.label || "Activité"}
                </Text>
              </View>
            </View>
          )}

          {/* Graphiques */}
          <BarChart
            data={stats.durationByType}
            title="Temps par activité"
            unit="min"
          />
          
          {Object.values(stats.distanceByType).some(v => v > 0) && (
            <BarChart
              data={stats.distanceByType}
              title="Distance par activité"
              unit="km"
            />
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
  },
  picker: {
    flex: 1,
    color: "#fff",
  },
  pickerItem: {
    color: "#fff",
    backgroundColor: "#1e1e1e",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#666",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    color: "#555",
    fontSize: 14,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  statUnit: {
    fontSize: 16,
    color: "#aaa",
  },
  statLabel: {
    fontSize: 13,
    color: "#aaa",
    marginTop: 4,
  },
  highlightCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ffd700",
  },
  highlightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffd700",
    marginLeft: 8,
  },
  highlightContent: {
    alignItems: "center",
  },
  highlightValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  highlightLabel: {
    fontSize: 16,
    color: "#aaa",
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
  barWrapper: {
    marginBottom: 12,
  },
  barLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 14,
    color: "#aaa",
    marginLeft: 8,
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  barBackground: {
    flex: 1,
    height: 24,
    backgroundColor: "#2a2a2a",
    borderRadius: 6,
    marginRight: 12,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#ffd700",
    borderRadius: 6,
  },
  barValue: {
    minWidth: 70,
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "right",
  },
});