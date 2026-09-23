import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../api/client';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../utils/theme';

const PRIORITY = {
  normal: { color: COLORS.info, bg: COLORS.surface, label: 'Info' },
  important: { color: COLORS.warning, bg: COLORS.surface, label: 'Important' },
  urgent: { color: COLORS.danger, bg: COLORS.surface, label: 'Urgent' },
};

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await client.get('/announcements');
      setAnnouncements(res.data.announcements || []);
    } catch (err) { console.log(err.message); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Municipal</Text>
        <Text style={styles.title}>City Alerts</Text>
      </View>

      <FlatList
        data={announcements}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(); }}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No active alerts</Text>
            <Text style={styles.emptyText}>You're all caught up.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const p = PRIORITY[item.priority] || PRIORITY.normal;
          return (
            <View style={styles.card}>
              <View style={[styles.accentBar, { backgroundColor: p.color }]} />
              <View style={styles.body}>
                <View style={styles.topRow}>
                  <View style={[styles.tag, { backgroundColor: p.color + '15' }]}>
                    <Text style={[styles.tagText, { color: p.color }]}>{p.label}</Text>
                  </View>
                  <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short',
                    })}
                  </Text>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBody}>{item.body}</Text>
                <Text style={styles.meta}>
                  {item.authorityId?.name || 'City-wide'}
                </Text>
              </View>
            </View>
          );
        }}
      />
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
  kicker: {
    fontSize: 10, fontWeight: '800', color: COLORS.accent,
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5, marginTop: 2 },

  list: { padding: SPACING.lg },

  card: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden', ...SHADOWS.sm,
  },
  accentBar: { width: 4 },
  body: { flex: 1, padding: SPACING.lg },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.sm },
  tagText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  date: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 4, letterSpacing: -0.2 },
  cardBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  meta: {
    fontSize: 10, color: COLORS.textMuted, marginTop: 10,
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6,
  },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  emptyText: { fontSize: 13, color: COLORS.textMuted, marginTop: 6 },
});