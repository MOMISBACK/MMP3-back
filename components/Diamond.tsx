// components/Diamond.tsx

import React, { useEffect, useMemo, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface DiamondProps {
  color: string;
  size?: number;
  active?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function Diamond({ color, size = 65, active = false }: DiamondProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  const ids = useMemo(() => {
    const uid = Math.random().toString(36).slice(2);
    return {
      gradientGem: `gemGradient-${uid}`,
      gradientHaloInner: `haloInner-${uid}`,
      gradientHaloMiddle: `haloMiddle-${uid}`,
      gradientHaloOuter: `haloOuter-${uid}`,
    };
  }, []);

  useEffect(() => {
    loopRef.current?.stop?.();

    if (active) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.25,
            friction: 3,
            tension: 40,
            useNativeDriver: false,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: false,
        }),
      ]).start();

      glowAnim.setValue(0);
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      );
      loopRef.current.start();
    } else {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      glowAnim.setValue(0);
    }

    return () => loopRef.current?.stop?.();
  }, [active]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['12deg', '0deg'],
  });

  const innerR = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 20],
  });
  const innerOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1.0],
  });

  const middleR = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 30],
  });
  const middleOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.65],
  });

  const outerR = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 38],
  });
  const outerOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.55],
  });

  if (!active) {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} viewBox="-20 -20 90 90">
          <Path
            d="M 25,5 L 45,18 L 37,45 L 13,45 L 5,18 Z"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
          />
        </Svg>
      </View>
    );
  }

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: scaleAnim }, { rotate: rotation }],
      }}
    >
      <Svg width={size} height={size} viewBox="-20 -20 90 90">
        <Defs>
          <RadialGradient id={ids.gradientHaloInner} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="30%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>

          <RadialGradient id={ids.gradientHaloMiddle} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.7" />
            <Stop offset="50%" stopColor={color} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>

          <RadialGradient id={ids.gradientHaloOuter} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <Stop offset="50%" stopColor={color} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>

          <RadialGradient id={ids.gradientGem} cx="50%" cy="30%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <Stop offset="50%" stopColor={color} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={color} stopOpacity="1" />
          </RadialGradient>
        </Defs>

        <AnimatedCircle cx={25} cy={25} r={outerR} opacity={outerOpacity} fill={`url(#${ids.gradientHaloOuter})`} />
        <AnimatedCircle cx={25} cy={25} r={middleR} opacity={middleOpacity} fill={`url(#${ids.gradientHaloMiddle})`} />
        <AnimatedCircle cx={25} cy={25} r={innerR} opacity={innerOpacity} fill={`url(#${ids.gradientHaloInner})`} />

        <Path d="M 25,5 L 45,18 L 37,45 L 13,45 L 5,18 Z" fill={`url(#${ids.gradientGem})`} opacity={0.95} />
        <Path d="M 25,5 L 25,25 L 45,18 Z" fill={color} opacity={0.75} />
        <Path d="M 25,5 L 25,25 L 5,18 Z" fill={color} opacity={0.55} />
        <Path d="M 25,25 L 37,45 L 13,45 Z" fill={color} opacity={0.65} />

        <Circle cx="21" cy="12" r="3" fill="#FFFFFF" opacity="0.9" />
        <Circle cx="28" cy="14" r="2.2" fill="#FFFFFF" opacity="0.75" />
        <Circle cx="25" cy="8" r="1.5" fill="#FFFFFF" opacity="0.85" />

        <Path
          d="M 25,5 L 45,18 L 37,45 L 13,45 L 5,18 Z"
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity="0.8"
        />
      </Svg>
    </Animated.View>
  );
}