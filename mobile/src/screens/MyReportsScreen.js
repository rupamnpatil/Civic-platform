import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, Image, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../api/client';
import useSocket from '../hooks/useSocket';
import { CATEGORY_EMOJI } from '../utils/categories';
import {
  COLORS, SPACING, RADIUS, SHADOWS,
  STATUS_COLORS, STATUS_BG, STATUS_LABELS,
} from '../utils/theme';

export default function MyReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await client.get('/reports/my');
      setReports(res.data.reports || []);
    } catch (err) { console.log(err.message); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchReports(); }, []));

  useSocket({
    onReportUpdated: (u) => setReports((prev) => prev.map((r) => r._id === u._id ? u : r)),
    onReportDeleted: ({ id }) => setReports((prev) => prev.filter((r) => r._id !== id)),
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (reports.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No reports yet</Text>
        <Text style={styles.emptyText}>Drop a pin on the map to get started.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.root}
      data={reports}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchReports(); }}
          tintColor={COLORS.primary}
        />
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ReportDetail', { id: item._id })}
        >
          {item.photoUrl && (
            <Image source={{ uri: item.photoUrl }} style={styles.thumb} />
          )}
          <View style={styles.body}>
            <View style={styles.row}>
              <Text style={styles.catLabel}>
                {CATEGORY_EMOJI[item.category]} {item.category.replace('_', ' ')}
              </Text>
              <View style={[styles.statusPill, { backgroundColor: STATUS_BG[item.status] }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                  {STATUS_LABELS[item.status]}
                </Text>
              </View>
            </View>
            <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.meta}>
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </Text>
              {item.upvotes?.length > 0 && (
                <Text style={styles.upvotes}>▲ {item.upvotes.length}</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.bg, padding: 30,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  emptyText: { fontSize: 13, color: COLORS.textMuted, marginTop: 6 },

  list: { padding: SPACING.lg },

  card: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, marginBottom: SPACING.md,
    overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  thumb: { width: 96, height: 96, backgroundColor: COLORS.surfaceAlt },
  body: { flex: 1, padding: SPACING.md, justifyContent: 'space-between' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catLabel: {
    fontSize: 10, fontWeight: '800', color: COLORS.text,
    textTransform: 'uppercase', letterSpacing: 0.4, flex: 1,
  },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  desc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 6, lineHeight: 17 },
  meta: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 8,
  },
  date: { fontSize: 11, color: COLORS.textMuted },
  upvotes: { fontSize: 11, fontWeight: '800', color: COLORS.accent },
});