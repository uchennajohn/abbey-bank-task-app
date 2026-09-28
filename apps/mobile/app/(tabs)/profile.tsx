import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/store/authContext';
import { Header } from '../../src/components/Header';
import { Avatar } from '../../src/components/Avatar';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { PostCard } from '../../src/components/PostCard';
import { EmptyState } from '../../src/components/EmptyState';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import type { PostResponse } from '@techies-social/shared';
import { postsApi } from '../../src/services/posts.service';
import { usersApi } from '../../src/services/users.service';

export default function ProfileScreen() {
  const { user, logout, updateUser, refreshUser } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Edit profile state
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editHeadline, setEditHeadline] = useState<string>('');
  const [editBio, setEditBio] = useState<string>('');
  const [editLocation, setEditLocation] = useState<string>('');
  const [editSkillsText, setEditSkillsText] = useState<string>('');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  const loadProfilePosts = useCallback(async (isRefresh = false) => {
    if (!user) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [res] = await Promise.all([
        postsApi.getPosts({ authorId: user.id }),
        refreshUser(),
      ]);
      setPosts(res.items);
    } catch (err) {
      console.error('Failed to load profile posts', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadProfilePosts();
  }, [loadProfilePosts]);

  const openEditModal = () => {
    if (!user) return;
    setEditName(user.name);
    setEditHeadline(user.headline || '');
    setEditBio(user.bio || '');
    setEditLocation(user.location || '');
    setEditSkillsText(user.skills?.join(', ') || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setSavingProfile(true);
    try {
      const skills = editSkillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = await usersApi.updateProfile({
        name: editName.trim(),
        headline: editHeadline.trim() || null,
        bio: editBio.trim() || null,
        location: editLocation.trim() || null,
        skills,
      });

      updateUser(updated);
      setEditModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderProfileHeader = () => (
    <View style={styles.profileHeaderCard}>
      <View style={styles.avatarSection}>
        <Avatar name={user.name} url={user.avatarUrl} size={76} />
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          {user.headline ? (
            <Text style={styles.userHeadline}>{user.headline}</Text>
          ) : null}
          {user.location ? (
            <Text style={styles.userLocation}>📍 {user.location}</Text>
          ) : null}
        </View>
      </View>

      {user.bio ? <Text style={styles.userBio}>{user.bio}</Text> : null}

      {/* Stats Counter Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.connectionsCount ?? 0}</Text>
          <Text style={styles.statLabel}>Connections</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{posts.length}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
      </View>

      {/* Skills */}
      {user.skills && user.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          <Text style={styles.sectionTitle}>Skills & Expertise</Text>
          <View style={styles.skillsWrapper}>
            {user.skills.map((skill, index) => (
              <Badge key={index} label={skill} variant="primary" />
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.profileActions}>
        <Button
          title="Edit Profile"
          variant="secondary"
          size="sm"
          onPress={openEditModal}
          style={styles.profileActionBtn}
        />
        <Button
          title="Sign Out"
          variant="outline"
          size="sm"
          onPress={handleLogout}
          style={styles.profileActionBtn}
        />
      </View>

      <View style={styles.postsDivider}>
        <Text style={styles.postsSectionTitle}>My Activity & Posts</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="My Profile" />

      {loading && !refreshing ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderProfileHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadProfilePosts(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No posts published"
              description="Share updates, architecture notes, and developer insights to build your profile presence."
            />
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              currentUserId={user.id}
              onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
            />
          )}
        />
      )}

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setEditModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Button
              title="Save"
              size="sm"
              loading={savingProfile}
              onPress={handleSaveProfile}
            />
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Input
              label="Full Name *"
              value={editName}
              onChangeText={setEditName}
            />
            <Input
              label="Headline"
              placeholder="e.g. Senior Frontend Architect @ Tech"
              value={editHeadline}
              onChangeText={setEditHeadline}
            />
            <Input
              label="Bio"
              placeholder="Brief summary about yourself..."
              multiline
              numberOfLines={3}
              value={editBio}
              onChangeText={setEditBio}
            />
            <Input
              label="Location"
              placeholder="e.g. San Francisco, CA / Remote"
              value={editLocation}
              onChangeText={setEditLocation}
            />
            <Input
              label="Skills (comma separated)"
              placeholder="e.g. React Native, TypeScript, GraphQL"
              value={editSkillsText}
              onChangeText={setEditSkillsText}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  profileHeaderCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerInfo: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  userName: {
    ...typography.h2,
    fontSize: 22,
  },
  userHeadline: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  userLocation: {
    ...typography.small,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  userBio: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginVertical: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h2,
    fontSize: 20,
    color: colors.primaryDark,
  },
  statLabel: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  skillsContainer: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.small,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  profileActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: spacing.lg,
  },
  profileActionBtn: {
    flex: 1,
  },
  postsDivider: {
    marginTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  postsSectionTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  modalCloseBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  modalCloseText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalTitle: {
    ...typography.h3,
  },
  modalScroll: {
    padding: spacing.lg,
  },
});
