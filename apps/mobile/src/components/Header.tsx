import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../constants/theme';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'TechiesSocial',
  showBack = false,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
      <View style={styles.content}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.logoText}>
            Techies<Text style={styles.logoHighlight}>Social</Text>
          </Text>
        )}

        {showBack && title ? (
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
        ) : null}

        <View style={styles.rightContainer}>{rightAction}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  logoHighlight: {
    color: colors.primary,
  },
  titleText: {
    ...typography.h3,
    fontSize: 17,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  backText: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 15,
  },
  rightContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
});
