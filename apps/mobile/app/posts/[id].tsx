import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/store/authContext';
import { Header } from '../../src/components/Header';
import { PostCard } from '../../src/components/PostCard';
import { CommentItem } from '../../src/components/CommentItem';
import { EmptyState } from '../../src/components/EmptyState';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import type { PostResponse } from '@techies-social/shared';
import { postsApi } from '../../src/services/posts.service';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // New comment input state
  const [commentText, setCommentText] = useState<string>('');
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);

  const loadPost = useCallback(
    async (isRefresh = false) => {
      if (!id) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await postsApi.getPostById(id);
        setPost(res);
      } catch (err) {
        console.error('Failed to load post details', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const handleAddComment = async () => {
    if (!commentText.trim() || !post || submittingComment) return;

    setSubmittingComment(true);
    try {
      const newComment = await postsApi.addComment(post.id, {
        content: commentText.trim(),
      });
      setPost((prev) =>
        prev
          ? {
              ...prev,
              commentsCount: prev.commentsCount + 1,
              comments: [...(prev.comments || []), newComment],
            }
          : null,
      );
      setCommentText('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentDeleted = (commentId: string) => {
    setPost((prev) =>
      prev
        ? {
            ...prev,
            commentsCount: Math.max(0, prev.commentsCount - 1),
            comments: prev.comments?.filter((c) => c.id !== commentId),
          }
        : null,
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Header showBack title="Discussion" />
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.container}>
        <Header showBack title="Discussion" />
        <EmptyState
          title="Post not found"
          description="This post may have been deleted by its author."
        />
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <PostCard post={post} currentUserId={user?.id} />
      <View style={styles.commentsHeading}>
        <Text style={styles.commentsTitle}>Comments ({post.comments?.length ?? 0})</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Header showBack title="Discussion" />

      <FlatList
        data={post.comments || []}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadPost(true)}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No comments yet"
            description="Start the discussion! Share your perspective, feedback, or ideas below."
          />
        }
        renderItem={({ item }) => (
          <CommentItem
            comment={item}
            currentUserId={user?.id}
            onCommentDeleted={handleCommentDeleted}
          />
        )}
      />

      {/* Pinned Bottom Comment Input */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Add a constructive comment..."
          placeholderTextColor={colors.textMuted}
          value={commentText}
          onChangeText={setCommentText}
          style={styles.textInput}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          onPress={handleAddComment}
          disabled={!commentText.trim() || submittingComment}
          style={[
            styles.sendButton,
            (!commentText.trim() || submittingComment) && styles.sendButtonDisabled,
          ]}
        >
          {submittingComment ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.sendText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 20,
  },
  headerSection: {
    marginBottom: spacing.md,
  },
  commentsHeading: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  commentsTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 24 : spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 9,
    paddingHorizontal: 16,
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceHover,
    opacity: 0.6,
  },
  sendText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '700',
  },
});
