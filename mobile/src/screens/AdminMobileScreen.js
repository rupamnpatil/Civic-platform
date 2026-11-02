import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Alert, RefreshControl, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import useSocket from '../hooks/useSocket';
import { CATEGORY_EMOJI } from '../utils/categories';
import {
  COLORS, SPACING, RADIUS, SHADOWS,
  STATUS_COLORS, STATUS_BG, STATUS_LABELS,
} from '../utils/theme';

const STATUSES = ['submitted', 'assigned', 'in_progress', 'resolved', 'rejected'];

export default function AdminMobileScreen() {
  const { user, logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchReports = async () => {
    try {
      const res = await client.get('/reports');
      setReports(res.data.reports || []);
    } catch (err) { console.log(err.message); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchReports(); }, []));

  useSocket({
    onReportNew: (r) =>
      setReports((prev) => (prev.some((x) => x._id === r._id) ? prev : [r, ...prev])),
    onReportUpdated: (u) =>
      setReports((prev) => prev.map((r) => (r._id === u._id ? u : r))),
    onReportDeleted: ({ id }) =>
      setReports((prev) => prev.filter((r) => r._id !== id)),
  });

  const updateStatus = (report, newStatus) => {
    Alert.alert(
      'Update Status',
      `Mark this report as "${STATUS_LABELS[newStatus]}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const res = await client.patch(`/reports/${report._id}/status`, {
                status: newStatus,
                note: `Updated by ${user.name}`,
              });
              setReports((prev) =>
                prev.map((r) => (r._id === res.data.report._id ? res.data.report : r))
              );
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed');
            }
          },
        },
      ]
    );
  };

  const deleteReport = (report) => {
    Alert.alert('Delete Report', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await client.delete(`/reports/${report._id}`);
            setReports((prev) => prev.filter((r) => r._id !== report._id));
          } catch (err) { Alert.alert('Error', 'Delete failed'); }
        },
      },
    ]);
  };

  const filtered = filter ? reports.filter((r) => r.status === filter) : reports;

  const stats = {
    total: reports.length,
    progress: reports.filter((r) => r.status === 'in_progress').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>Administrator</Text>
            <Text style={styles.title}>{user.name}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <StatBox value={stats.total} label="Total" />
          <StatBox value={stats.progress} label="Active" />
          <StatBox value={stats.resolved} label="Resolved" />
        </View>
      </View>

      <View style={styles.filters}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: '', label: 'All' }, ...STATUSES.map((s) => ({ id: s, label: STATUS_LABELS[s] }))]}
          keyExtractor={(item) => item.id || 'all'}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item.id)}
              style={[styles.chip, filter === item.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, filter === item.id && styles.chipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchReports(); }}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No reports found</Text>
            <Text style={styles.emptyText}>Nothing in this queue.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.photoUrl && (
              <Image source={{ uri: item.photoUrl }} style={styles.cardImg} />
            )}
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Text style={styles.cat}>
                  {CATEGORY_EMOJI[item.category] || '•'} {item.category.replace('_', ' ')}
                </Text>
                <View style={[styles.statusPill, { backgroundColor: STATUS_BG[item.status] }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                    {STATUS_LABELS[item.status]}
                  </Text>
                </View>
              </View>

              <Text style={styles.desc}>{item.description}</Text>
              <Text style={styles.meta}>
                {item.address || `${item.location.coordinates[1].toFixed(4)}°, ${item.location.coordinates[0].toFixed(4)}°`}
                {' · '}{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                {item.upvotes?.length > 0 && ` · ▲ ${item.upvotes.length}`}
              </Text>

              <View style={styles.actions}>
                {STATUSES.filter((s) => s !== item.status).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.actionBtn, { borderColor: STATUS_COLORS[s] }]}
                    onPress={() => updateStatus(item, s)}
                  >
                    <Text style={[styles.actionText, { color: STATUS_COLORS[s] }]}>
                      {STATUS_LABELS[s]}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: COLORS.danger, marginLeft: 'auto' }]}
                  onPress={() => deleteReport(item)}
                >
                  <Text style={[styles.actionText, { color: COLORS.danger }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

function StatBox({ value, label }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },

  header: {
    paddingHorizontal: SPACING.xl, paddingTop: 60, paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: {
    fontSize: 10, fontWeight: '800', color: COLORS.accent,
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, letterSpacing: -0.4, marginTop: 2 },
  logoutBtn: {
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceAlt,
  },
  logoutText: { fontSize: 11, fontWeight: '800', color: COLORS.danger, textTransform: 'uppercase', letterSpacing: 0.5 },

  statsRow: { flexDirection: 'row', gap: 8, marginTop: SPACING.lg },
  statBox: {
    flex: 1, backgroundColor: COLORS.surfaceAlt, padding: 10,
    borderRadius: RADIUS.md, alignItems: 'center',
  },
  statVal: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  statLabel: {
    fontSize: 9, fontWeight: '800', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2,
  },

  filters: { paddingVertical: SPACING.md },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  chipTextActive: { color: '#fff' },

  list: { paddingHorizontal: SPACING.lg, paddingBottom: 40 },

  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    marginBottom: SPACING.md, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  cardImg: { width: '100%', height: 140, backgroundColor: COLORS.surfaceAlt },
  cardBody: { padding: SPACING.lg },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.sm,
  },
  cat: {
    fontSize: 11, fontWeight: '800', color: COLORS.text,
    textTransform: 'uppercase', letterSpacing: 0.4, flex: 1,
  },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },

  desc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  meta: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },

  actions: {
    flexDirection: 'row', gap: 6, marginTop: SPACING.md,
    flexWrap: 'wrap', paddingTop: SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  actionBtn: {
    paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: RADIUS.sm, borderWidth: 1,
  },
  actionText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  emptyText: { fontSize: 13, color: COLORS.textMuted, marginTop: 6 },
});
