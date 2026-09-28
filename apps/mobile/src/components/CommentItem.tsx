import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Avatar } from './Avatar';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import type { CommentResponse } from '@techies-social/shared';
import { postsApi } from '../services/posts.service';

interface CommentItemProps {
  comment: CommentResponse;
  currentUserId?: string;
  onCommentDeleted?: (commentId: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onCommentDeleted,
}) => {
  const isAuthor = currentUserId === comment.authorId;

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const handleDelete = () => {
    Alert.alert('Delete Comment', 'Are you sure you want to remove this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await postsApi.deleteComment(comment.postId, comment.id);
            onCommentDeleted?.(comment.id);
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Could not delete comment');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Avatar name={comment.author.name} url={comment.author.avatarUrl} size={36} />
      <View style={styles.bubble}>
        <View style={styles.header}>
          <Text style={styles.name}>{comment.author.name}</Text>
          <Text style={styles.time}>{formatTimeAgo(comment.createdAt)}</Text>
        </View>
        <Text style={styles.content}>{comment.content}</Text>
      </View>
      {isAuthor && (
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  bubble: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginLeft: spacing.sm,
    marginRight: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    ...typography.bodyBold,
    fontSize: 13,
  },
  time: {
    ...typography.small,
    fontSize: 11,
    color: colors.textMuted,
  },
  content: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  deleteBtn: {
    padding: 4,
    opacity: 0.6,
  },
  deleteText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
