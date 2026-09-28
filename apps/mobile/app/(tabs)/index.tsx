import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../src/store/authContext';
import { Header } from '../../src/components/Header';
import { PostCard } from '../../src/components/PostCard';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { EmptyState } from '../../src/components/EmptyState';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import type { PostResponse } from '@techies-social/shared';
import { postsApi } from '../../src/services/posts.service';

export default function FeedScreen() {
  const { user } = useAuth();
  const [feedType, setFeedType] = useState<'all' | 'connections'>('all');
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Create post modal state
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newContent, setNewContent] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string>('');

  const fetchPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await postsApi.getPosts({ feedType, limit: 30 });
      setPosts(res.items);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [feedType]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async () => {
    if (!newContent.trim()) {
      setCreateError('Please write something to post');
      return;
    }

    setCreating(true);
    setCreateError('');
    try {
      const newPost = await postsApi.createPost({ content: newContent.trim() });
      setPosts((prev) => [newPost, ...prev]);
      setNewContent('');
      setModalVisible(false);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to publish post');
    } finally {
      setCreating(false);
    }
  };

  const handlePostDeleted = (deletedId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  return (
    <View style={styles.container}>
      <Header
        rightAction={
          <Button
            title="+ Post"
            size="sm"
            onPress={() => setModalVisible(true)}
          />
        }
      />

      {/* Feed Filter Segment */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          onPress={() => setFeedType('all')}
          style={[styles.segmentBtn, feedType === 'all' && styles.segmentBtnActive]}
        >
          <Text
            style={[
              styles.segmentText,
              feedType === 'all' && styles.segmentTextActive,
            ]}
          >
            All Techies
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFeedType('connections')}
          style={[
            styles.segmentBtn,
            feedType === 'connections' && styles.segmentBtnActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              feedType === 'connections' && styles.segmentTextActive,
            ]}
          >
            My Network
          </Text>
        </TouchableOpacity>
      </View>

      {/* Posts List */}
      {loading && !refreshing ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchPosts(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title={feedType === 'all' ? 'No posts yet' : 'No network posts'}
              description={
                feedType === 'all'
                  ? 'Be the first to share an update, thought, or architecture discussion!'
                  : 'Connect with other techies to see their posts here in your network feed.'
              }
              actionTitle="+ Create Post"
              onAction={() => setModalVisible(true)}
            />
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              currentUserId={user?.id}
              onPostDeleted={handlePostDeleted}
            />
          )}
        />
      )}

      {/* Create Post Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Post</Text>
            <Button
              title="Publish"
              size="sm"
              loading={creating}
              disabled={!newContent.trim() || creating}
              onPress={handleCreatePost}
            />
          </View>

          <View style={styles.modalBody}>
            {createError ? (
              <View style={styles.modalError}>
                <Text style={styles.modalErrorText}>{createError}</Text>
              </View>
            ) : null}

            <Input
              placeholder="What are you building or thinking about today? Share insights, code snippets, questions..."
              multiline
              numberOfLines={6}
              value={newContent}
              onChangeText={setNewContent}
              style={styles.modalTextArea}
              autoFocus
            />

            <Text style={styles.charCount}>
              {newContent.length} / 3000 characters
            </Text>
          </View>
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
  segmentContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  segmentBtnActive: {
    backgroundColor: colors.primaryMuted,
  },
  segmentText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
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
    fontSize: 17,
  },
  modalBody: {
    padding: spacing.lg,
    flex: 1,
  },
  modalError: {
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  modalErrorText: {
    ...typography.small,
    color: colors.danger,
    fontWeight: '600',
  },
  modalTextArea: {
    minHeight: 180,
    textAlignVertical: 'top',
    fontSize: 16,
    lineHeight: 24,
  },
  charCount: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});
