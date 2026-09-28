import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/store/authContext';
import { Header } from '../../src/components/Header';
import { Avatar } from '../../src/components/Avatar';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { PostCard } from '../../src/components/PostCard';
import { EmptyState } from '../../src/components/EmptyState';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import type { UserResponse, PostResponse } from '@techies-social/shared';
import { ConnectionStatus } from '@techies-social/shared';
import { usersApi } from '../../src/services/users.service';
import { postsApi } from '../../src/services/posts.service';
import { connectionsApi } from '../../src/services/connections.service';

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const loadUserData = useCallback(
    async (isRefresh = false) => {
      if (!id) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const [userData, postsData] = await Promise.all([
          usersApi.getUserById(id),
          postsApi.getPosts({ authorId: id }),
        ]);
        setProfile(userData);
        setPosts(postsData.items);
      } catch (err) {
        console.error('Failed to load user profile', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleConnect = async () => {
    if (!profile || actionLoading) return;
    setActionLoading(true);
    try {
      await connectionsApi.sendRequest(profile.id);
      await loadUserData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send connection request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!profile?.connectionId || actionLoading) return;
    setActionLoading(true);
    try {
      await connectionsApi.updateStatus(profile.connectionId, ConnectionStatus.ACCEPTED);
      await loadUserData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to accept connection');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveConnection = () => {
    if (!profile?.connectionId) return;
    Alert.alert(
      'Remove Connection',
      `Are you sure you want to remove ${profile.name} from your network?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await connectionsApi.removeConnection(profile.connectionId!);
              await loadUserData();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to remove connection');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderConnectionAction = () => {
    if (!profile || profile.id === currentUser?.id) {
      return null;
    }

    if (profile.connectionStatus === ConnectionStatus.ACCEPTED) {
      return (
        <Button
          title="Connected ✓"
          variant="secondary"
          size="sm"
          onPress={handleRemoveConnection}
          loading={actionLoading}
        />
      );
    }

    if (profile.connectionStatus === ConnectionStatus.PENDING) {
      if (profile.isRequester) {
        return (
          <Button
            title="Accept Request"
            variant="primary"
            size="sm"
            onPress={handleAccept}
            loading={actionLoading}
          />
        );
      }
      return (
        <Button
          title="Pending Request"
          variant="outline"
          size="sm"
          disabled
        />
      );
    }

    return (
      <Button
        title="+ Connect"
        variant="primary"
        size="sm"
        onPress={handleConnect}
        loading={actionLoading}
      />
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Header showBack title="Profile" />
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Header showBack title="Profile" />
        <EmptyState
          title="User not found"
          description="The user you are looking for does not exist or has been removed."
        />
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.profileHeaderCard}>
      <View style={styles.avatarSection}>
        <Avatar name={profile.name} url={profile.avatarUrl} size={76} />
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{profile.name}</Text>
          {profile.headline ? (
            <Text style={styles.userHeadline}>{profile.headline}</Text>
          ) : null}
          {profile.location ? (
            <Text style={styles.userLocation}>📍 {profile.location}</Text>
          ) : null}
        </View>
      </View>

      {profile.bio ? <Text style={styles.userBio}>{profile.bio}</Text> : null}

      {/* Stats Counter */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile.connectionsCount ?? 0}</Text>
          <Text style={styles.statLabel}>Connections</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{posts.length}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
      </View>

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          <Text style={styles.sectionTitle}>Skills & Expertise</Text>
          <View style={styles.skillsWrapper}>
            {profile.skills.map((skill, index) => (
              <Badge key={index} label={skill} variant="primary" />
            ))}
          </View>
        </View>
      )}

      {/* Action Button */}
      {renderConnectionAction() && (
        <View style={styles.actionSection}>{renderConnectionAction()}</View>
      )}

      <View style={styles.postsDivider}>
        <Text style={styles.postsSectionTitle}>{profile.name}'s Posts</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header showBack title={profile.name} />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadUserData(true)}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No posts published yet"
            description={`${profile.name} hasn't posted anything yet.`}
          />
        }
        renderItem={({ item }) => (
          <PostCard post={item} currentUserId={currentUser?.id} />
        )}
      />
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
  actionSection: {
    marginTop: spacing.lg,
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
});
