import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../api/client';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../utils/theme';

export default function RewardsScreen() {
  const [data, setData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, lbRes] = await Promise.all([
        client.get('/users/me/stats'),
        client.get('/users/leaderboard'),
      ]);
      setData(statsRes.data);
      setLeaderboard(lbRes.data.leaderboard || []);
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

  const earnedIds = data?.badges || [];

  return (
    <ScrollView
      style={styles.root}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchData(); }}
          tintColor={COLORS.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>Your standing</Text>
        <Text style={styles.title}>Civic Rewards</Text>
      </View>

      <View style={styles.pointsCard}>
        <Text style={styles.pointsLabel}>Total Points</Text>
        <Text style={styles.pointsValue}>{data?.points || 0}</Text>
        <View style={styles.statsRow}>
          <Stat label="Reports" value={data?.stats?.reportCount || 0} />
          <Stat label="Upvotes" value={data?.stats?.totalUpvotes || 0} />
          <Stat label="Resolved" value={data?.stats?.resolvedCount || 0} />
        </View>
      </View>

      <Text style={styles.section}>Badges</Text>
      <View style={styles.badgeGrid}>
        {(data?.allBadges || []).map((badge) => {
          const earned = earnedIds.includes(badge.id);
          const parts = badge.label.split(' ');
          return (
            <View
              key={badge.id}
              style={[styles.badgeCard, !earned && styles.badgeLocked]}
            >
              <Text style={[styles.badgeEmoji, !earned && { opacity: 0.25 }]}>
                {parts[0]}
              </Text>
              <Text
                style={[styles.badgeLabel, !earned && { color: COLORS.textMuted }]}
                numberOfLines={2}
              >
                {parts.slice(1).join(' ')}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.section}>Top Citizens</Text>
      <View style={styles.lbCard}>
        {leaderboard.length === 0 ? (
          <Text style={styles.lbEmpty}>No citizens yet.</Text>
        ) : (
          leaderboard.map((u, idx) => (
            <View
              key={u._id}
              style={[
                styles.lbRow,
                idx !== leaderboard.length - 1 && styles.lbRowBorder,
              ]}
            >
              <Text style={[styles.lbRank, idx < 3 && { color: COLORS.accent }]}>
                {String(idx + 1).padStart(2, '0')}
              </Text>
              <View style={styles.lbAvatar}>
                <Text style={styles.lbAvatarText}>
                  {u.name[0]?.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.lbName} numberOfLines={1}>{u.name}</Text>
              <Text style={styles.lbPoints}>{u.points}</Text>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
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
  kicker: {
    fontSize: 10, fontWeight: '800', color: COLORS.accent,
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5, marginTop: 2 },

  pointsCard: {
    backgroundColor: COLORS.primary, margin: SPACING.lg,
    borderRadius: RADIUS.xl, padding: SPACING.xl, ...SHADOWS.lg,
  },
  pointsLabel: {
    fontSize: 10, fontWeight: '800', color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: 1.2,
  },
  pointsValue: {
    fontSize: 52, fontWeight: '900', color: '#fff',
    letterSpacing: -2, marginTop: 4, marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row', gap: SPACING.lg,
    paddingTop: SPACING.lg, borderTopWidth: 1, borderTopColor: '#1E293B',
  },
  stat: { flex: 1 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#fff' },
  statLabel: {
    fontSize: 10, fontWeight: '700', color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 2,
  },

  section: {
    fontSize: 12, fontWeight: '800', color: COLORS.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginHorizontal: SPACING.lg, marginTop: SPACING.xl, marginBottom: SPACING.md,
  },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.lg, gap: 8 },
  badgeCard: {
    width: '31.5%', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: SPACING.md,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  badgeLocked: { opacity: 0.55 },
  badgeEmoji: { fontSize: 28 },
  badgeLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.text,
    marginTop: 6, textAlign: 'center', letterSpacing: 0.1,
  },

  lbCard: {
    backgroundColor: COLORS.surface, marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden', ...SHADOWS.sm,
  },
  lbRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg,
  },
  lbRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  lbRank: {
    fontSize: 13, fontWeight: '900', color: COLORS.textMuted,
    width: 30, letterSpacing: 0.5,
  },
  lbAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.surfaceAlt, marginRight: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  lbAvatarText: { color: COLORS.text, fontSize: 11, fontWeight: '800' },
  lbName: { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.text },
  lbPoints: { fontSize: 14, fontWeight: '900', color: COLORS.accent },
  lbEmpty: { textAlign: 'center', color: COLORS.textMuted, padding: SPACING.xl, fontSize: 13 },
});