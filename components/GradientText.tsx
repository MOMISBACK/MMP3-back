// components/GradientText.tsx

import React from 'react';
import { Text, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

interface GradientTextProps {
  children: string;
  colors: string[];
  style?: any;
}

export function GradientText({ children, colors, style }: GradientTextProps) {
  if (Platform.OS === 'web') {
    // ⭐ Sur Web : utiliser CSS gradient
    return (
      <Text
        style={[
          style,
          {
            background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          } as any,
        ]}
      >
        {children}
      </Text>
    );
  }

  // ⭐ Sur iOS/Android : utiliser MaskedView
  return (
    <MaskedView
      maskElement={
        <Text style={[style, styles.mask]}>{children}</Text>
      }
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[style, styles.transparent]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  mask: {
    backgroundColor: 'transparent',
  },
  gradient: {
    paddingHorizontal: 8,
  },
  transparent: {
    opacity: 0,
  },
});