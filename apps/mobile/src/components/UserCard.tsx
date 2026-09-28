import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';
import { colors, typography, spacing } from '../constants/theme';
import type { UserResponse } from '@techies-social/shared';
import { ConnectionStatus } from '@techies-social/shared';
import { connectionsApi } from '../services/connections.service';

interface UserCardProps {
  user: UserResponse;
  onConnectionChange?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onConnectionChange }) => {
  const router = useRouter();
  const [status, setStatus] = useState(user.connectionStatus || 'NONE');
  const [loading, setLoading] = useState(false);

  const handlePressCard = () => {
    if (status === 'SELF') {
      router.push('/(tabs)/profile');
    } else {
      router.push(`/users/${user.id}`);
    }
  };

  const handleConnect = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await connectionsApi.sendRequest(user.id);
      setStatus(ConnectionStatus.PENDING);
      onConnectionChange?.();
    } catch (err) {
      console.error('Failed to send connection request:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderActionButton = () => {
    if (status === 'SELF') {
      return <Badge label="You" variant="neutral" />;
    }

    if (status === ConnectionStatus.ACCEPTED) {
      return (
        <Button
          title="Connected"
          variant="secondary"
          size="sm"
          onPress={handlePressCard}
        />
      );
    }

    if (status === ConnectionStatus.PENDING) {
      return (
        <Button
          title={user.isRequester ? 'Pending' : 'Respond'}
          variant="outline"
          size="sm"
          onPress={handlePressCard}
        />
      );
    }

    return (
      <Button
        title="Connect"
        variant="primary"
        size="sm"
        loading={loading}
        onPress={handleConnect}
      />
    );
  };

  return (
    <Card>
      <TouchableOpacity
        onPress={handlePressCard}
        activeOpacity={0.8}
        style={styles.container}
      >
        <View style={styles.topRow}>
          <Avatar name={user.name} url={user.avatarUrl} size={48} />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {user.name}
            </Text>
            {user.headline ? (
              <Text style={styles.headline} numberOfLines={1}>
                {user.headline}
              </Text>
            ) : null}
            {user.location ? (
              <Text style={styles.location} numberOfLines={1}>
                📍 {user.location}
              </Text>
            ) : null}
          </View>
          <View style={styles.action}>{renderActionButton()}</View>
        </View>

        {user.skills && user.skills.length > 0 && (
          <View style={styles.skillsRow}>
            {user.skills.slice(0, 4).map((skill, index) => (
              <Badge key={index} label={skill} size="sm" variant="primary" />
            ))}
            {user.skills.length > 4 && (
              <Badge
                label={`+${user.skills.length - 4}`}
                size="sm"
                variant="neutral"
              />
            )}
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  name: {
    ...typography.bodyBold,
    fontSize: 16,
  },
  headline: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 1,
  },
  location: {
    ...typography.small,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  action: {
    marginLeft: 'auto',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    paddingTop: spacing.xs,
  },
});
