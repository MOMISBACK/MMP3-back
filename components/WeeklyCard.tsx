// components/WeeklyCard.tsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWeekCountdown } from '../hooks/useWeekCountdown';
import { useChallenge } from '../context/ChallengeContext';
import { theme } from '../utils/theme';
import { Diamond } from './Diamond';
import { GradientText } from './GradientText';
import { activityConfig } from '../utils/activityConfig';

interface WeeklyCardProps {
  onChallengePress: () => void;
  onCreateChallenge: () => void;
}

export function WeeklyCard({ onChallengePress, onCreateChallenge }: WeeklyCardProps) {
  const { days, hours, minutes, seconds } = useWeekCountdown();
  const { currentChallenge } = useChallenge();

  const [expanded, setExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: expanded ? 1 : 0,
      duration: 380,
      easing: Easing.bezier(0.2, 0, 0, 1),
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const animatedHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(contentHeight, 1)],
  });
  const animatedOpacity = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const translateY = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 0],
  });
  const chevronRotation = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const onMeasureContent = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h && Math.abs(h - contentHeight) > 1) {
      setContentHeight(h);
    }
  };

  const DIAMOND_SIZE = 75;
  const TOTAL_DIAMONDS = 8;

  const myProgress = currentChallenge?.progress?.current ?? 0;
  const myGoal = currentChallenge?.goalValue ?? 3;

  const progressPercent = Math.min((myProgress / myGoal) * 100, 100);
  const myDiamondCount = Math.floor(progressPercent / 12.5);
  const totalPercent = Math.round(progressPercent);
  const isComplete = myProgress >= myGoal;

  const getDiamondPositions = (count: number) => {
    const radius = 90;
    const centerX = 120;
    const centerY = 120;
    const offset = DIAMOND_SIZE / 2;
    const positions: Array<{ top: number; left: number }> = [];
    const angleStep = (2 * Math.PI) / count;
    const startAngle = -Math.PI / 2;

    for (let i = 0; i < count; i++) {
      const angle = startAngle + i * angleStep;
      const x = centerX + radius * Math.cos(angle) - offset;
      const y = centerY + radius * Math.sin(angle) - offset;
      positions.push({ top: y, left: x });
    }
    return positions;
  };

  const diamondPositions = useMemo(() => getDiamondPositions(TOTAL_DIAMONDS), []);

  const formatGoalValue = (value: number, type: string) => {
    switch (type) {
      case 'distance':
        return `${value} km`;
      case 'duration': {
        const h = Math.floor(value / 60);
        const m = value % 60;
        return h > 0 ? `${h}h${m > 0 ? m.toString().padStart(2, '0') : ''}` : `${m}min`;
      }
      case 'count':
        return `${value} activité${value > 1 ? 's' : ''}`;
      default:
        return String(value);
    }
  };

  // 🎨 Couleur bleu-lavande douce qui s'harmonise avec le turquoise
  const ACTIVITY_COLOR = '#7B9FFF';

  // ⭐ Contenu de la carte - VERSION SIMPLIFIÉE
  const ChallengeInner = () => (
    <View style={styles.challengeContentInner}>
      {/* 🎯 Phrase objectif avec valeur en évidence */}
      <Text style={styles.objectiveText}>
        <Text style={styles.objectiveValue}>
          {currentChallenge ? formatGoalValue(currentChallenge.goalValue, currentChallenge.goalType) : ''}
        </Text>
        {' '}à faire avant dimanche soir
      </Text>

      {/* 🏃 Activités sélectionnées - petites chips en ligne (toutes bleu-lavande) */}
      <View style={styles.activityChipsContainer}>
        {currentChallenge?.activityTypes.map((type, index) => {
          const config = activityConfig[type];
          return (
            <View key={index} style={styles.activityChip}>
              <LinearGradient
                colors={[`${ACTIVITY_COLOR}25`, `${ACTIVITY_COLOR}10`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.activityChipGradient}
              >
                <View style={[styles.activityChipIconContainer, { backgroundColor: `${ACTIVITY_COLOR}20` }]}>
                  <Ionicons
                    name={config?.icon as any}
                    size={14}
                    color={ACTIVITY_COLOR}
                  />
                </View>
                <Text style={[styles.activityChipText, { color: ACTIVITY_COLOR }]}>
                  {config?.label}
                </Text>
              </LinearGradient>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={theme.gradients.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* COMPTE À REBOURS */}
      <View style={styles.countdownSection}>
        <Text style={styles.countdownLabel}>TEMPS RESTANT</Text>
        <View style={styles.countdownRow}>
          <View style={styles.timeUnit}>
            <GradientText colors={theme.gradients.countdown} style={styles.timeValue}>
              {days.toString().padStart(2, '0')}
            </GradientText>
            <Text style={styles.timeLabel}>JOURS</Text>
          </View>
          <View style={styles.timeUnit}>
            <GradientText colors={theme.gradients.countdown} style={styles.timeValue}>
              {hours.toString().padStart(2, '0')}
            </GradientText>
            <Text style={styles.timeLabel}>HEURES</Text>
          </View>
          <View style={styles.timeUnit}>
            <GradientText colors={theme.gradients.countdown} style={styles.timeValue}>
              {minutes.toString().padStart(2, '0')}
            </GradientText>
            <Text style={styles.timeLabel}>MINUTES</Text>
          </View>
          <View style={styles.timeUnit}>
            <GradientText colors={theme.gradients.countdown} style={styles.timeValue}>
              {seconds.toString().padStart(2, '0')}
            </GradientText>
            <Text style={styles.timeLabel}>SECONDES</Text>
          </View>
        </View>
      </View>

      <View style={styles.separator} />

      {/* SECTION CHALLENGE */}
      {currentChallenge ? (
        <View style={styles.challengeSection}>
          <View style={styles.challengeCard}>
            {/* Header cliquable (toggle uniquement) */}
            <TouchableOpacity
              style={styles.challengeCardHeader}
              onPress={() => setExpanded(v => !v)}
              activeOpacity={0.85}
            >
              <Text style={styles.challengeTitle}>Challenge de la semaine</Text>
              <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
                <Ionicons name="chevron-down" size={20} color={theme.colors.users.primary} />
              </Animated.View>
            </TouchableOpacity>

            {/* Mesure invisible */}
            <View style={styles.measure} onLayout={onMeasureContent}>
              <ChallengeInner />
            </View>

            {/* Contenu animé (PAS cliquable) */}
            <Animated.View
              style={[
                styles.challengeContentAnimated,
                { height: animatedHeight, opacity: animatedOpacity },
              ]}
            >
              <Animated.View style={{ flex: 1, transform: [{ translateY }] }}>
                <ChallengeInner />
              </Animated.View>
            </Animated.View>
          </View>

          {/* DIAMANTS */}
          <View style={styles.diamondsContainer}>
            {diamondPositions.map((pos, index) => {
              const isActive = index < myDiamondCount;
              const color = isComplete ? theme.colors.users.victory : theme.colors.users.primary;
              return (
                <View key={index} style={[styles.diamondSlot, pos]}>
                  <Diamond color={color} size={DIAMOND_SIZE} active={isActive} />
                </View>
              );
            })}

            {/* ⭐ CENTRE CLIQUABLE (bouton vers détail) */}
            <TouchableOpacity 
              style={styles.centerCircle}
              onPress={onChallengePress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isComplete 
                  ? ['#1a1a2e', '#16213e']
                  : ['rgba(22, 33, 62, 0.95)', 'rgba(22, 33, 62, 0.85)']}
                style={styles.centerBackground}
              >
                {isComplete ? (
                  <View style={styles.centerContent}>
                    <Text style={styles.centerIcon}>💎</Text>
                    <Text style={styles.centerLabelComplete}>COMPLET</Text>
                  </View>
                ) : (
                  <View style={styles.centerContent}>
                    <GradientText colors={theme.gradients.countdown} style={styles.centerPercentage}>
                      {totalPercent}%
                    </GradientText>
                    <Text style={styles.centerLabel}>DÉTAILS</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.createChallengeSection} onPress={onCreateChallenge} activeOpacity={0.7}>
          <Ionicons name="add-circle-outline" size={32} color={theme.colors.text.muted} />
          <Text style={styles.createChallengeText}>Créer un défi</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  countdownSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  countdownLabel: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 1,
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 8,
  },
  timeUnit: {
    alignItems: 'center',
    flex: 1,
  },
  timeValue: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
  },
  timeLabel: {
    fontSize: 10,
    color: theme.colors.text.tertiary,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: 20,
  },
  challengeSection: {
    paddingTop: 0,
  },
  challengeCard: {
    backgroundColor: `${theme.colors.users.primary}08`,
    borderWidth: 1,
    borderColor: `${theme.colors.users.primary}30`,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  challengeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  challengeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  challengeContentAnimated: {
    overflow: 'hidden',
  },
  challengeContentInner: {
    paddingHorizontal: 18,
    paddingBottom: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.users.primary}15`,
    alignItems: 'flex-start',
  },
  measure: {
    position: 'absolute',
    left: 0,
    right: 0,
    opacity: 0,
    pointerEvents: 'none',
  },

  // 🎯 PHRASE OBJECTIF
  objectiveText: {
    fontSize: 15,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  objectiveValue: {
    fontSize: 15,
    color: theme.colors.users.primary, // Couleur turquoise qui ressort
    fontWeight: '700',
  },

  // 🏃 ACTIVITÉS - PETITES CHIPS EN LIGNE (BLEU-LAVANDE DOUX)
  activityChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityChip: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  activityChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  activityChipIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // DIAMANTS
  diamondsContainer: {
    width: 240,
    height: 240,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 20,
    position: 'relative',
  },
  diamondSlot: {
    position: 'absolute',
    width: 75,
    height: 75,
  },
  centerCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 85,
    height: 85,
    marginLeft: -42.5,
    marginTop: -42.5,
    borderRadius: 42.5,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(95, 227, 217, 0.5)',
    shadowColor: theme.colors.users.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  centerBackground: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    gap: 2,
  },
  centerPercentage: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  centerLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  centerIcon: {
    fontSize: 30,
    lineHeight: 34,
  },
  centerLabelComplete: {
    fontSize: 8,
    color: '#fff',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  createChallengeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  createChallengeText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
});