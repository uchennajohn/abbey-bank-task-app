import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, typography } from '../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
}) => {
  const variantStyles = {
    primary: { bg: colors.primaryMuted, text: colors.primaryDark },
    secondary: { bg: '#E0F2FE', text: '#0369A1' },
    success: { bg: colors.successLight, text: '#065F46' },
    warning: { bg: colors.warningLight, text: '#92400E' },
    neutral: { bg: colors.surface, text: colors.textSecondary },
  }[variant];

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: variantStyles.bg },
        isSmall && styles.badgeSm,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: variantStyles.text },
          isSmall && styles.textSm,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginRight: 6,
    marginBottom: 6,
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  text: {
    ...typography.small,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 10,
  },
});
