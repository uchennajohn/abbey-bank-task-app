import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from './Avatar';
import { Card } from './Card';
import { colors, typography, spacing } from '../constants/theme';
import type { PostResponse } from '@techies-social/shared';
import { postsApi } from '../services/posts.service';

interface PostCardProps {
  post: PostResponse;
  currentUserId?: string;
  onPostDeleted?: (postId: string) => void;
  onPressPost?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onPostDeleted,
  onPressPost,
}) => {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState<boolean>(post.isLikedByMe ?? false);
  const [likesCount, setLikesCount] = useState<number>(post.likesCount);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  const isAuthor = currentUserId === post.authorId;

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const handleToggleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    // Optimistic update
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await postsApi.toggleLike(post.id);
      setIsLiked(res.isLiked);
      setLikesCount(res.likesCount);
    } catch {
      // Revert if error
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await postsApi.deletePost(post.id);
              onPostDeleted?.(post.id);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not delete post');
            }
          },
        },
      ]
    );
  };

  const navigateToAuthor = () => {
    if (post.authorId === currentUserId) {
      router.push('/(tabs)/profile');
    } else {
      router.push(`/users/${post.authorId}`);
    }
  };

  const handleCardPress = () => {
    if (onPressPost) {
      onPressPost(post.id);
    } else {
      router.push(`/posts/${post.id}`);
    }
  };

  return (
    <Card>
      {/* Author Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.authorRow}
          onPress={navigateToAuthor}
          activeOpacity={0.7}
        >
          <Avatar
            name={post.author.name}
            url={post.author.avatarUrl}
            size={42}
          />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName} numberOfLines={1}>
              {post.author.name}
            </Text>
            {post.author.headline ? (
              <Text style={styles.authorHeadline} numberOfLines={1}>
                {post.author.headline}
              </Text>
            ) : null}
            <Text style={styles.timestamp}>{formatTimeAgo(post.createdAt)}</Text>
          </View>
        </TouchableOpacity>

        {isAuthor && (
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Post Body */}
      <TouchableOpacity
        onPress={handleCardPress}
        activeOpacity={0.85}
        style={styles.contentContainer}
      >
        <Text style={styles.content}>{post.content}</Text>
      </TouchableOpacity>

      {/* Actions (Like & Comment) */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleToggleLike}
          activeOpacity={0.7}
          style={[styles.actionBtn, isLiked && styles.actionBtnLiked]}
        >
          <Text style={[styles.actionIcon, isLiked && styles.actionIconLiked]}>
            {isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.actionText, isLiked && styles.actionTextLiked]}>
            {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCardPress}
          activeOpacity={0.7}
          style={styles.actionBtn}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>
            {post.commentsCount} {post.commentsCount === 1 ? 'Comment' : 'Comments'}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  authorInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  authorName: {
    ...typography.bodyBold,
    fontSize: 15,
  },
  authorHeadline: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  timestamp: {
    ...typography.small,
    fontSize: 11,
    marginTop: 1,
  },
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteText: {
    ...typography.small,
    color: colors.danger,
    fontWeight: '600',
  },
  contentContainer: {
    marginBottom: spacing.md,
  },
  content: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  actionBtnLiked: {
    backgroundColor: '#FEE2E2',
  },
  actionIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  actionIconLiked: {
    color: colors.danger,
  },
  actionText: {
    ...typography.small,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  actionTextLiked: {
    color: colors.danger,
  },
});
