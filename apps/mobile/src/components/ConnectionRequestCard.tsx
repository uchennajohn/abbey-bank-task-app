import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Card } from './Card';
import { colors, typography, spacing } from '../constants/theme';
import type { ConnectionResponse } from '@techies-social/shared';
import { ConnectionStatus } from '@techies-social/shared';
import { connectionsApi } from '../services/connections.service';

interface ConnectionRequestCardProps {
  request: ConnectionResponse;
  onStatusChanged?: (id: string, newStatus: ConnectionStatus) => void;
}

export const ConnectionRequestCard: React.FC<ConnectionRequestCardProps> = ({
  request,
  onStatusChanged,
}) => {
  const [loadingAction, setLoadingAction] = useState<'accept' | 'reject' | null>(null);

  const handleAction = async (status: ConnectionStatus.ACCEPTED | ConnectionStatus.REJECTED) => {
    setLoadingAction(status === ConnectionStatus.ACCEPTED ? 'accept' : 'reject');
    try {
      await connectionsApi.updateStatus(request.id, status);
      onStatusChanged?.(request.id, status);
    } catch (err) {
      console.error('Failed to update connection status', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const sender = request.requester;

  return (
    <Card>
      <View style={styles.topRow}>
        <Avatar name={sender.name} url={sender.avatarUrl} size={46} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {sender.name}
          </Text>
          {sender.headline ? (
            <Text style={styles.headline} numberOfLines={1}>
              {sender.headline}
            </Text>
          ) : null}
          <Text style={styles.timeText}>
            Wants to connect with you
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Button
          title="Accept"
          variant="primary"
          size="sm"
          loading={loadingAction === 'accept'}
          disabled={loadingAction !== null}
          onPress={() => handleAction(ConnectionStatus.ACCEPTED)}
          style={styles.actionBtn}
        />
        <Button
          title="Decline"
          variant="secondary"
          size="sm"
          loading={loadingAction === 'reject'}
          disabled={loadingAction !== null}
          onPress={() => handleAction(ConnectionStatus.REJECTED)}
          style={styles.actionBtn}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    ...typography.bodyBold,
    fontSize: 15,
  },
  headline: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  timeText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
});
