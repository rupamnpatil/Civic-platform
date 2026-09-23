import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../api/client';

const STATUS_COLORS = {
  submitted: '#f59e0b',
  assigned: '#3b82f6',
  in_progress: '#8b5cf6',
  resolved: '#10b981',
  rejected: '#ef4444',
};

export default function MyReportsScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await client.get('/reports/my');
      setReports(res.data.reports || []);
    } catch (err) {
      console.log('Error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (reports.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No reports yet.</Text>
        <Text style={styles.emptySub}>Drop a pin on the map to get started.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reports}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => (
        <View style={styles.card}>
          {item.photoUrl && <Image source={{ uri: item.photoUrl }} style={styles.thumb} />}
          <View style={styles.cardBody}>
            <View style={styles.row}>
              <Text style={styles.category}>{item.category.toUpperCase()}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] }]}>
                <Text style={styles.badgeText}>{item.status.replace('_', ' ')}</Text>
              </View>
            </View>
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#333' },
  emptySub: { fontSize: 14, color: '#888', marginTop: 8, textAlign: 'center' },
  list: { padding: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  thumb: { width: 90, height: 90, backgroundColor: '#eee' },
  cardBody: { flex: 1, padding: 12, justifyContent: 'space-between' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { fontSize: 12, fontWeight: '700', color: '#2563eb' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  description: { fontSize: 14, color: '#333', marginTop: 6 },
  date: { fontSize: 11, color: '#999', marginTop: 6 },
});