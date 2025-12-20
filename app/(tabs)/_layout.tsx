// app/(tabs)/_layout.tsx

import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Platform } from 'react-native';
import { theme } from '../../utils/theme';

export default function TabLayout() {
  return (
    <>
      {Platform.OS === 'web' && (
        <LinearGradient
          colors={theme.gradients.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.users.primary,
          tabBarInactiveTintColor: theme.colors.text.tertiary,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#14141e',
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            paddingBottom: Platform.select({
              ios: 50,
              android: 45,
              web: 30,
            }),
            paddingTop: 8,
            height: Platform.select({
              ios: 120,
              android: 110,
              web: 90,
            }),
            position: 'absolute',
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginBottom: Platform.select({
              ios: 6,
              android: 6,
              web: 2,
            }),
          },
          tabBarIconStyle: {
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Accueil",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={22} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: "Stats",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "bar-chart" : "bar-chart-outline"} 
                size={22} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Profil",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "person" : "person-outline"} 
                size={22} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen name="users" options={{ href: null }} />
        <Tabs.Screen name="activities" options={{ href: null }} />
      </Tabs>
    </>
  );
}