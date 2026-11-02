import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import client from '../api/client';
import useSocket from '../hooks/useSocket';
import { CATEGORY_EMOJI } from '../utils/categories';
import { useAuth } from '../context/AuthContext';
import {
  COLORS, SPACING, RADIUS, SHADOWS,
  STATUS_COLORS, STATUS_BG, STATUS_LABELS,
} from '../utils/theme';

export default function ReportDetailScreen({ route }) {
  const { id } = route.params;
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReport(); }, [id]);

  const fetchReport = async () => {
    try {
      const res = await client.get(`/reports/${id}`);
      setReport(res.data.report);
    } catch (err) {
      Alert.alert('Error', 'Could not load report.');
    } finally {
      setLoading(false);
    }
  };

  // Live status and upvote synchronization
  useSocket({
    onReportUpdated: (updated) => {
      if (updated._id === id) {
        setReport(updated);
      }
    },
  });

  const handleUpvote = async () => {
    try {
      const res = await client.post(`/reports/${id}/upvote`);
      if (res.data.success) {
        fetchReport();
      }
    } catch (err) { console.log(err.message); }
  };

  if (loading || !report) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  const currentUserId = user?.id || user?._id;
  const hasUpvoted = report.upvotes?.some(
    (u) => String(u._id || u) === String(currentUserId)
  );
  const upvoteCount = report.upvotes?.length || 0;

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
      {report.photoUrl && (
        <Image source={{ uri: report.photoUrl }} style={styles.hero} />
      )}

      <View style={styles.content}>
        <View style={styles.headRow}>
          <View style={styles.catRow}>
            <Text style={styles.catEmoji}>{CATEGORY_EMOJI[report.category] || '•'}</Text>
            <Text style={styles.catLabel}>
              {report.category.replace('_', ' ')}
            </Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: STATUS_BG[report.status] }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[report.status] }]}>
              {STATUS_LABELS[report.status]}
            </Text>
          </View>
        </View>

        <Text style={styles.description}>{report.description}</Text>

        <InfoRow label="Location" value={report.address || `${report.location.coordinates[1].toFixed(5)}°, ${report.location.coordinates[0].toFixed(5)}°`} />
        <InfoRow label="Reported by" value={report.reporterId?.name || 'Anonymous'} />
        <InfoRow label="Reported on" value={new Date(report.createdAt).toLocaleString()} />
        {report.authorityId && (
          <InfoRow
            label="Assigned to"
            value={`${report.authorityId.name} · ${report.authorityId.department}`}
          />
        )}

        <TouchableOpacity
          style={[styles.upvote, hasUpvoted && styles.upvoteActive]}
          onPress={handleUpvote}
          activeOpacity={0.85}
        >
          <Text style={[styles.upvoteText, hasUpvoted && styles.upvoteTextActive]}>
            {hasUpvoted ? '▲ Upvoted' : '▲ Upvote this report'} · {upvoteCount}
          </Text>
        </TouchableOpacity>

        <Text style={styles.timelineTitle}>Status Timeline</Text>
        <View style={styles.timeline}>
          {(report.statusHistory || []).map((entry, idx) => {
            const isLast = idx === report.statusHistory.length - 1;
            return (
              <View key={idx} style={styles.tlRow}>
                <View style={styles.tlLeft}>
                  <View style={[styles.tlDot, { backgroundColor: STATUS_COLORS[entry.status] }]} />
                  {!isLast && <View style={styles.tlLine} />}
                </View>
                <View style={styles.tlRight}>
                  <Text style={styles.tlStatus}>{STATUS_LABELS[entry.status]}</Text>
                  {entry.note ? <Text style={styles.tlNote}>{entry.note}</Text> : null}
                  <Text style={styles.tlTime}>{new Date(entry.timestamp).toLocaleString()}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },

  hero: { width: '100%', height: 240, backgroundColor: COLORS.surfaceAlt },
  content: { padding: SPACING.lg },

  headRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.md,
  },
  catRow: { flexDirection: 'row', alignItems: 'center' },
  catEmoji: { fontSize: 18, marginRight: 8 },
  catLabel: {
    fontSize: 12, fontWeight: '800', color: COLORS.text,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },

  description: {
    fontSize: 15, color: COLORS.text, lineHeight: 22,
    fontWeight: '500', marginBottom: SPACING.xl,
  },

  infoRow: {
    backgroundColor: COLORS.surface, padding: SPACING.md,
    borderRadius: RADIUS.md, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 10, fontWeight: '800', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  infoValue: { fontSize: 13, color: COLORS.text, fontWeight: '600', marginTop: 4 },

  upvote: {
    backgroundColor: COLORS.primary, paddingVertical: 16,
    borderRadius: RADIUS.md, alignItems: 'center', marginTop: SPACING.md,
  },
  upvoteActive: { backgroundColor: COLORS.accent },
  upvoteText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },
  upvoteTextActive: { color: '#fff' },

  timelineTitle: {
    fontSize: 12, fontWeight: '800', color: COLORS.text,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginTop: SPACING.xxl, marginBottom: SPACING.lg,
  },
  timeline: { paddingLeft: 4 },
  tlRow: { flexDirection: 'row' },
  tlLeft: { alignItems: 'center', width: 20 },
  tlDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  tlLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginVertical: 2 },
  tlRight: { flex: 1, paddingLeft: SPACING.md, paddingBottom: SPACING.xl },
  tlStatus: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  tlNote: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  tlTime: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
});
