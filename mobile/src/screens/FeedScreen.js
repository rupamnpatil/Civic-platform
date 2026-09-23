import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../api/client';
import useSocket from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_EMOJI } from '../utils/categories';
import {
  COLORS, SPACING, RADIUS, SHADOWS,
  STATUS_COLORS, STATUS_BG, STATUS_LABELS,
} from '../utils/theme';

export default function FeedScreen({ navigation }) {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState('recent');

  const fetchFeed = async () => {
    try {
      const res = await client.get(`/reports/feed?sort=${sort}`);
      setReports(res.data.reports || []);
    } catch (err) {
      console.log('Feed error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchFeed(); }, [sort]));

  useSocket({
    onReportNew: (r) => setReports((prev) => prev.some((x) => x._id === r._id) ? prev : [r, ...prev]),
    onReportUpdated: (r) => setReports((prev) => prev.map((x) => x._id === r._id ? r : x)),
    onReportDeleted: ({ id }) => setReports((prev) => prev.filter((x) => x._id !== id)),
  });

  const handleUpvote = async (report) => {
    try {
      await client.post(`/reports/${report._id}/upvote`);
      setReports((prev) =>
        prev.map((r) => {
          if (r._id !== report._id) return r;
          const hasUpvoted = r.upvotes?.some((u) => String(u) === String(user.id));
          return {
            ...r,
            upvotes: hasUpvoted
              ? r.upvotes.filter((u) => String(u) !== String(user.id))
              : [...(r.upvotes || []), user.id],
          };
        })
      );
    } catch (err) {
      console.log('Upvote error:', err.message);
    }
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
        <View>
          <Text style={styles.kicker}>Community</Text>
          <Text style={styles.title}>Activity Feed</Text>
        </View>
        <View style={styles.segment}>
          <TouchableOpacity
            style={[styles.segBtn, sort === 'recent' && styles.segBtnActive]}
            onPress={() => setSort('recent')}
          >
            <Text style={[styles.segText, sort === 'recent' && styles.segTextActive]}>
              Recent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segBtn, sort === 'popular' && styles.segBtnActive]}
            onPress={() => setSort('popular')}
          >
            <Text style={[styles.segText, sort === 'popular' && styles.segTextActive]}>
              Popular
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchFeed(); }}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No reports yet</Text>
            <Text style={styles.emptyText}>
              Be the first to report an issue in your area.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const hasUpvoted = item.upvotes?.some((u) => String(u) === String(user.id));
          const upvoteCount = item.upvotes?.length || 0;

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ReportDetail', { id: item._id })}
            >
              <View style={styles.cardHead}>
                <View style={styles.catRow}>
                  <Text style={styles.catEmoji}>{CATEGORY_EMOJI[item.category] || '•'}</Text>
                  <Text style={styles.catLabel}>
                    {item.category.replace('_', ' ')}
                  </Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: STATUS_BG[item.status] }]}>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
                  <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                    {STATUS_LABELS[item.status]}
                  </Text>
                </View>
              </View>

              {item.photoUrl && (
                <Image source={{ uri: item.photoUrl }} style={styles.image} />
              )}

              <Text style={styles.desc} numberOfLines={2}>
                {item.description}
              </Text>

              {item.address ? (
                <Text style={styles.address} numberOfLines={1}>
                  {item.address}
                </Text>
              ) : null}

              <View style={styles.footer}>
                <View style={styles.userRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.reporterId?.name?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{item.reporterId?.name || 'Anonymous'}</Text>
                    <Text style={styles.date}>
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short',
                      })}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.vote, hasUpvoted && styles.voteActive]}
                  onPress={() => handleUpvote(item)}
                >
                  <Text style={[styles.voteText, hasUpvoted && styles.voteTextActive]}>
                    ▲ {upvoteCount}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
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
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl, paddingTop: 60, paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  kicker: {
    fontSize: 10, fontWeight: '800', color: COLORS.accent,
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  title: {
    fontSize: 24, fontWeight: '800', color: COLORS.text,
    letterSpacing: -0.5, marginTop: 2,
  },

  segment: {
    flexDirection: 'row', backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md, padding: 3,
  },
  segBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: RADIUS.sm },
  segBtnActive: { backgroundColor: COLORS.surface, ...SHADOWS.sm },
  segText: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.3 },
  segTextActive: { color: COLORS.text },

  list: { padding: SPACING.lg, paddingBottom: 40 },

  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },

  cardHead: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.md,
  },
  catRow: { flexDirection: 'row', alignItems: 'center' },
  catEmoji: { fontSize: 14, marginRight: 6 },
  catLabel: {
    fontSize: 11, fontWeight: '800', color: COLORS.text,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },

  statusPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },

  image: {
    width: '100%', height: 180, borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt, marginBottom: SPACING.md,
  },
  desc: { fontSize: 14, color: COLORS.text, lineHeight: 20, fontWeight: '500' },
  address: { fontSize: 12, color: COLORS.textMuted, marginTop: 6 },

  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: SPACING.md, paddingTop: SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.primary, marginRight: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  userName: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  date: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },

  vote: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  voteActive: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.accent },
  voteText: { fontSize: 12, fontWeight: '800', color: COLORS.textSecondary },
  voteTextActive: { color: COLORS.accent },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  emptyText: { fontSize: 13, color: COLORS.textMuted, marginTop: 6, textAlign: 'center' },
});