// app/(tabs)/index.tsx

import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal, 
  Alert,
  ScrollView,
  Platform
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import { ActivityForm } from "../../components/ActivityForm";
import { ActivityItem } from "../../components/ActivityItem";
import { useActivities } from "../../context/ActivityContext";
import { useAuth } from "../../context/AuthContext";
import { WeeklyCard } from '../../components/WeeklyCard';
import { ChallengeDetailModal } from '../../components/WeeklyChallenge/ChallengeDetailModal';
import { ChallengeForm } from '../../components/WeeklyChallenge/ChallengeForm';
import { theme } from '../../utils/theme';

export default function HomeScreen() {
  const { activities, removeActivity, error, clearError } = useActivities();
  const { user } = useAuth();
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [showChallengeDetail, setShowChallengeDetail] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert("Erreur", error, [{ text: "OK", onPress: clearError }]);
    }
  }, [error]);

  const handleCreateChallengeSuccess = () => {
    setShowChallengeForm(false);
    Alert.alert('✅ Succès', 'Défi créé avec succès !');
  };

  const getUserInitial = () => {
    if (!user?.email) return '?';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarsStack}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.avatar, styles.avatar1]}
              >
                <Text style={styles.avatarText}>{getUserInitial()}</Text>
              </LinearGradient>
              
              <View style={[styles.avatar, styles.avatar2, styles.avatarEmpty]}>
                <Ionicons name="person-add-outline" size={20} color="#666" />
              </View>
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.teamName}>
                {user?.email?.split('@')[0] || 'Utilisateur'}
              </Text>
              <Text style={styles.teamSubtitle}>Mode solo</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="people-outline" size={18} color={theme.colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="settings-outline" size={18} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* ScrollView */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Carte challenge */}
        <WeeklyCard 
          onChallengePress={() => setShowChallengeDetail(true)}
          onCreateChallenge={() => setShowChallengeForm(true)}
        />

        {/* Titre activités */}
        <View style={styles.activitiesTitleRow}>
          <Ionicons name="pulse" size={20} color={theme.colors.users.primary} />
          <Text style={styles.activitiesTitle}>Historique des activités</Text>
        </View>

        {/* Liste activités */}
        {activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏃</Text>
            <Text style={styles.emptyText}>Aucune activité</Text>
            <Text style={styles.emptySubtext}>Ajoutez votre première activité</Text>
          </View>
        ) : (
          activities.map((activity) => (
            <ActivityItem 
              key={activity._id || activity.id} 
              activity={activity} 
              onDelete={removeActivity} 
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsFormVisible(true)}
      >
        <LinearGradient
          colors={[theme.colors.users.primary, '#4DD4CA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#000" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal activité */}
      <Modal
        visible={isFormVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFormVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityForm onClose={() => setIsFormVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Modal détail défi */}
      <ChallengeDetailModal 
        visible={showChallengeDetail}
        onClose={() => setShowChallengeDetail(false)}
      />

      {/* Modal création défi */}
      <Modal
        visible={showChallengeForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowChallengeForm(false)}
      >
        <View style={styles.challengeModalHeader}>
          <TouchableOpacity onPress={() => setShowChallengeForm(false)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.challengeModalTitle}>Nouveau défi</Text>
          <View style={{ width: 28 }} />
        </View>
        <ChallengeForm 
          mode="create"
          onSuccess={handleCreateChallengeSuccess}
          onCancel={() => setShowChallengeForm(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg.primary,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarsStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatar1: {
    borderColor: theme.colors.users.primary,
    shadowColor: theme.colors.users.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 2,
  },
  avatar2: {
    marginLeft: -12,
    zIndex: 1,
  },
  avatarEmpty: {
    backgroundColor: '#1a1a2e',
    borderColor: '#333',
    shadowOpacity: 0,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  teamSubtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.select({
      ios: 140,      // ⭐ Espace pour FAB + nav (120 + 20)
      android: 130,  // ⭐ (110 + 20)
      web: 110,      // ⭐ (90 + 20)
    }),
  },
  activitiesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    marginTop: 8,
  },
  activitiesTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: theme.colors.text.tertiary,
  },
  // ⭐ FAB remonté
  fab: {
    position: 'absolute',
    bottom: Platform.select({
      ios: 130,      // ⭐ 10px au-dessus de la nav (120 + 10)
      android: 130,  // ⭐ 10px au-dessus (110 + 10)
      web: 130,      // ⭐ 10px au-dessus (90 + 10)
    }),
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: theme.colors.users.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.bg.primary,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  challengeModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: theme.colors.bg.card,
    borderRadius: 10,
    padding: 20,
  },
});