// app/_layout.tsx

import { Slot, useRouter, useSegments } from "expo-router";
import { ActivityProvider } from "../context/ActivityContext";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ChallengeProvider } from "../context/ChallengeContext";
import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";

const InitialLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (isAuthenticated && inAuthGroup) {
      router.replace("/");
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#111' }}>
        <ActivityIndicator size="large" color="#ffd700" />
        <Text style={{ color: '#fff', marginTop: 20 }}>Chargement...</Text>
      </View>
    );
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ChallengeProvider>
        <ActivityProvider>
          <InitialLayout />
        </ActivityProvider>
      </ChallengeProvider>
    </AuthProvider>
  );
}