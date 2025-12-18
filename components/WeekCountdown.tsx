import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWeekCountdown } from '../hooks/useWeekCountdown';

/**
 * Compte à rebours jusqu'au prochain lundi minuit
 * Utilisé pour les défis hebdomadaires
 */
export const WeekCountdown: React.FC = () => {
  const { days, hours, minutes, seconds } = useWeekCountdown();

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <View style={styles.timeBlock}>
      <Text style={styles.timeValue}>{value.toString().padStart(2, '0')}</Text>
      <Text style={styles.timeLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.countdown}>
        <TimeBlock value={days} label="J" />
        <Text style={styles.separator}>:</Text>
        <TimeBlock value={hours} label="H" />
        <Text style={styles.separator}>:</Text>
        <TimeBlock value={minutes} label="M" />
        <Text style={styles.separator}>:</Text>
        <TimeBlock value={seconds} label="S" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  countdown: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start', // 👈 CHANGÉ de 'center' à 'flex-start'
  },
  timeBlock: {
    alignItems: 'center',
    minWidth: 50,
  },
  timeValue: {
    color: '#ffd700',
    fontSize: 32,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    lineHeight: 38, // 👈 AJOUTÉ pour hauteur uniforme
  },
  timeLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  separator: {
    color: '#444',
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 4,
    lineHeight: 38, // 👈 AJOUTÉ - même que timeValue
    includeFontPadding: false, // 👈 AJOUTÉ pour Android
  },
});