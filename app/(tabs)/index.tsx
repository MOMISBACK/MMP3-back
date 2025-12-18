// app/(tabs)/index.tsx

import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Modal, Alert, ScrollView } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ActivityForm } from "../../components/ActivityForm";
import { ActivityList } from "../../components/ActivityList";
import { useActivities } from "../../context/ActivityContext";
import { useAuth } from "../../context/AuthContext";
import { WeekCountdown } from '../../components/WeekCountdown';
import { useChallenge } from '../../context/ChallengeContext'; // ⭐ AJOUTER
import { ChallengeCard } from '../../components/WeeklyChallenge/ChallengeCard'; // ⭐ AJOUTER
import { ChallengeForm } from '../../components/WeeklyChallenge/ChallengeForm'; // ⭐ AJOUTER

export default function HomeScreen() {
  const { activities, removeActivity, error, clearError } = useActivities();
  const { user, logout } = useAuth();
  const { currentChallenge } = useChallenge(); // ⭐ AJOUTER
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false); // ⭐ AJOUTER
  const [editMode, setEditMode] = useState(false); // ⭐ AJOUTER

  useEffect(() => {
    if (error) {
      Alert.alert("Erreur", error, [{ text: "OK", onPress: clearError }]);
    }
  }, [error]);

  // ⭐ AJOUTER - Handlers pour le défi
  const handleCreateChallenge = () => {
    setEditMode(false);
    setShowChallengeForm(true);
  };

  const handleEditChallenge = () => {
    setEditMode(true);
    setShowChallengeForm(true);
  };

  return (
    <View style={styles.container}>
      {/* Header avec navigation */}
      <View style={styles.headerContainer}>
        <Text style={styles.header} numberOfLines={1} ellipsizeMode="tail">
          Activités de {user ? user.email.split('@')[0] : "..."}
        </Text>
        <Link href="/users" asChild>
          <TouchableOpacity style={styles.settingsButton} testID="friends-button">
            <Ionicons name="people-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </Link>
        <Link href="/settings" asChild>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Compte à rebours de la semaine */}
      <WeekCountdown />

      {/* ⭐ AJOUTER - Section Défi Hebdomadaire */}
      <View style={styles.challengeSection}>
        {currentChallenge ? (
          <ChallengeCard onEdit={handleEditChallenge} />
        ) : (
          <TouchableOpacity 
            style={styles.createChallengeCard}
            onPress={handleCreateChallenge}
          >
            <Ionicons name="add-circle-outline" size={48} color="#ffd700" />
            <Text style={styles.createChallengeTitle}>
              Créer un défi hebdomadaire
            </Text>
            <Text style={styles.createChallengeSubtitle}>
              Fixez-vous un objectif pour cette semaine
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Liste des activités */}
      <ActivityList activities={activities} onDelete={removeActivity} />

      {/* Bouton flottant pour ajouter une activité */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsFormVisible(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Modal du formulaire d'ajout d'activité */}
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

      {/* ⭐ AJOUTER - Modal du formulaire de défi */}
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
          <Text style={styles.challengeModalTitle}>
            {editMode ? 'Modifier le défi' : 'Nouveau défi'}
          </Text>
          <View style={{ width: 28 }} />
        </View>
        <ChallengeForm 
          onClose={() => setShowChallengeForm(false)} 
          editMode={editMode}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    marginRight: 10,
  },
  settingsButton: {
    padding: 5,
  },
  // ⭐ AJOUTER - Styles pour le défi
  challengeSection: {
    marginVertical: 16,
  },
  createChallengeCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  createChallengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  createChallengeSubtitle: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
    textAlign: 'center',
  },
  challengeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  challengeModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  // Styles existants
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#ffd700',
    borderRadius: 28,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
    color: '#111',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 20,
  }
});