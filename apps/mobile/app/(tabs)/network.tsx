import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../src/components/Header';
import { Input } from '../../src/components/Input';
import { UserCard } from '../../src/components/UserCard';
import { EmptyState } from '../../src/components/EmptyState';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import type { UserResponse } from '@techies-social/shared';
import { usersApi } from '../../src/services/users.service';

const POPULAR_SKILLS = [
  'All',
  'TypeScript',
  'React Native',
  'Node.js',
  'Python',
  'Go',
  'Design',
  'PostgreSQL',
  'Docker',
];

export default function DiscoverScreen() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchUsers = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const skillParam = selectedSkill === 'All' ? undefined : selectedSkill;
        const res = await usersApi.getUsers({
          search: search.trim() || undefined,
          skill: skillParam,
          limit: 30,
        });
        setUsers(res.items);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, selectedSkill],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  return (
    <View style={styles.container}>
      <Header title="Discover Techies" />

      {/* Search Bar & Skills Filter */}
      <View style={styles.filterSection}>
        <Input
          placeholder="Search by name, role, or company..."
          value={search}
          onChangeText={setSearch}
          containerStyle={styles.searchInput}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.skillsScroll}
        >
          {POPULAR_SKILLS.map((skill) => {
            const isSelected = selectedSkill === skill;
            return (
              <TouchableOpacity
                key={skill}
                onPress={() => setSelectedSkill(skill)}
                style={[styles.skillChip, isSelected && styles.skillChipActive]}
              >
                <Text style={[styles.skillChipText, isSelected && styles.skillChipTextActive]}>
                  {skill}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Users List */}
      {loading && !refreshing ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchUsers(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No techies found"
              description="Try changing your search terms or skill filters to find professionals."
              actionTitle="Clear Filters"
              onAction={() => {
                setSearch('');
                setSelectedSkill('All');
              }}
            />
          }
          renderItem={({ item }) => (
            <UserCard user={item} onConnectionChange={() => fetchUsers()} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterSection: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: 10,
  },
  searchInput: {
    // marginHorizontal: spacing.xs,
    marginBottom: spacing.xs,
  },
  skillsScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skillChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  skillChipText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  skillChipTextActive: {
    color: colors.white,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
});
