import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

interface AvatarProps {
  name?: string;
  url?: string | null;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ name = 'User', url, size = 44 }) => {
  const getInitials = (str: string) => {
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      const first = parts[0][0] || '';
      const second = parts[1][0] || '';
      return (first + second).toUpperCase();
    }
    return (str.trim().slice(0, 2) || 'U').toUpperCase();
  };

  // Deterministic color based on name
  const getBackgroundColor = (str: string) => {
    const palette = ['#6366F1', '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palette[Math.abs(hash) % palette.length];
  };

  const dynamicStyles = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={[styles.image, dynamicStyles]}
        accessibilityLabel={`${name}'s avatar`}
      />
    );
  }

  const bgColor = getBackgroundColor(name);
  const fontSize = Math.max(12, Math.floor(size * 0.38));

  return (
    <View
      style={[
        styles.fallback,
        dynamicStyles,
        { backgroundColor: bgColor },
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surface,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
