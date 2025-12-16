
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading } = useAuth();

  const handleRegister = async () => {
    try {
      await register(email, password);
    } catch (error) {
      Alert.alert("Erreur d'inscription", "Cette adresse e-mail est peut-être déjà utilisée.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Inscription</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.buttonContainer} onPress={handleRegister} disabled={isLoading} testID="registerButton">
            <Text style={styles.buttonText}>{isLoading ? "Création du compte..." : "S'inscrire"}</Text>
          </TouchableOpacity>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#111',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 16,
  },
  formContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#1e1e1e',
    ...Platform.select({
      web: {
        maxWidth: 400,
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      }
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 50,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#fff',
    marginBottom: 16,
    fontSize: 16,
  },
  buttonContainer: {
    backgroundColor: '#ffd700',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#ffd700',
    textAlign: 'center',
    marginTop: 20,
  }
});
