import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/store/authContext';
import { colors } from '../src/constants/theme';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Animation values
  const logoBadgeScale = useRef(new Animated.Value(0.4)).current;
  const logoBadgeOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkY = useRef(new Animated.Value(16)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const dot1Opacity = useRef(new Animated.Value(0.2)).current;
  const dot2Opacity = useRef(new Animated.Value(0.2)).current;
  const dot3Opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      // 1. Logo badge pops in
      Animated.parallel([
        Animated.spring(logoBadgeScale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoBadgeOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // 2. Wordmark slides up
      Animated.parallel([
        Animated.timing(wordmarkOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(wordmarkY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // 3. Tagline fades in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Looping dot pulse animation
    const pulseDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.2, duration: 400, useNativeDriver: true }),
        ])
      );

    pulseDot(dot1Opacity, 0).start();
    pulseDot(dot2Opacity, 200).start();
    pulseDot(dot3Opacity, 400).start();
  }, []);

  // Navigate when auth resolves
  useEffect(() => {
    if (!isLoading) {
      const timeout = setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      }, 200); // short buffer so animation has played
      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <View style={styles.container}>
      {/* Decorative background circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Center content */}
      <View style={styles.centerContent}>
        {/* Logo badge */}
        <Animated.View
          style={[
            styles.logoBadge,
            { opacity: logoBadgeOpacity, transform: [{ scale: logoBadgeScale }] },
          ]}
        >
          <Text style={styles.logoBadgeText}>TS</Text>
        </Animated.View>

        {/* Wordmark */}
        <Animated.View
          style={{ opacity: wordmarkOpacity, transform: [{ translateY: wordmarkY }] }}
        >
          <Text style={styles.wordmark}>
            Techies<Text style={styles.wordmarkAccent}>Social</Text>
          </Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Where tech professionals connect
        </Animated.Text>
      </View>

      {/* Loading dots at bottom */}
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
        <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
        <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
      </View>

      {/* Version label */}
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B', // deep indigo — darker than primary for contrast
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Decorative blurred background circles
  bgCircle1: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: colors.primaryDark,
    opacity: 0.25,
    top: -width * 0.3,
    right: -width * 0.25,
  },
  bgCircle2: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: colors.secondary,
    opacity: 0.12,
    bottom: -width * 0.2,
    left: -width * 0.2,
  },

  centerContent: {
    alignItems: 'center',
  },

  // Logo Badge
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 12,
  },
  logoBadgeText: {
    color: colors.white,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  // Wordmark
  wordmark: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -1,
    textAlign: 'center',
  },
  wordmarkAccent: {
    color: colors.primaryLight,
  },

  // Tagline
  tagline: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.55)',
    marginTop: 10,
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  // Loading dots
  dotsContainer: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryLight,
  },

  // Version
  version: {
    position: 'absolute',
    bottom: 44,
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 0.5,
  },
});

