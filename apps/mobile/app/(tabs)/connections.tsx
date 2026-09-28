import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../../src/components/Header';
import { UserCard } from '../../src/components/UserCard';
import { ConnectionRequestCard } from '../../src/components/ConnectionRequestCard';
import { EmptyState } from '../../src/components/EmptyState';
import { colors, typography, spacing, borderRadius } from '../../src/constants/theme';
import type { UserResponse, ConnectionResponse } from '@techies-social/shared';
import { connectionsApi } from '../../src/services/connections.service';

export default function ConnectionsScreen() {
  const [tab, setTab] = useState<'connected' | 'invitations' | 'sent'>('connected');
  const [connections, setConnections] = useState<UserResponse[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionResponse[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [myConns, incoming, outgoing] = await Promise.all([
        connectionsApi.getMyConnections(),
        connectionsApi.getPendingRequests(),
        connectionsApi.getSentRequests(),
      ]);
      setConnections(myConns);
      setPendingRequests(incoming);
      setSentRequests(outgoing);
    } catch (err) {
      console.error('Failed to load connections data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = () => {
    loadData();
  };

  return (
    <View style={styles.container}>
      <Header title="My Network" />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setTab('connected')}
          style={[styles.tabBtn, tab === 'connected' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, tab === 'connected' && styles.tabTextActive]}>
            Connected ({connections.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab('invitations')}
          style={[styles.tabBtn, tab === 'invitations' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, tab === 'invitations' && styles.tabTextActive]}>
            Invites ({pendingRequests.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab('sent')}
          style={[styles.tabBtn, tab === 'sent' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, tab === 'sent' && styles.tabTextActive]}>
            Sent ({sentRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : tab === 'connected' ? (
        <FlatList
          data={connections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No connections yet"
              description="Discover developers and engineers to grow your professional network."
            />
          }
          renderItem={({ item }) => (
            <UserCard user={item} onConnectionChange={() => loadData()} />
          )}
        />
      ) : tab === 'invitations' ? (
        <FlatList
          data={pendingRequests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No pending invites"
              description="When other techies send you a connection request, it will appear here."
            />
          }
          renderItem={({ item }) => (
            <ConnectionRequestCard
              request={item}
              onStatusChanged={handleStatusChange}
            />
          )}
        />
      ) : (
        <FlatList
          data={sentRequests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No sent requests"
              description="Connection requests you send to others will be tracked here."
            />
          }
          renderItem={({ item }) => (
            <UserCard
              user={{
                ...item.receiver,
                connectionStatus: item.status,
                isRequester: true,
              }}
              onConnectionChange={() => loadData()}
            />
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  tabBtnActive: {
    backgroundColor: colors.primaryMuted,
  },
  tabText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
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
});
