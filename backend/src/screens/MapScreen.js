import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Leaflet from 'react-native-leaflet-ts';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export default function MapScreen({ navigation }) {
  const { logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const fetchNearbyReports = async () => {
    try {
      const res = await client.get('/reports/nearby?lat=12.95&lng=77.55&radius=50000');
      setReports(res.data.reports || []);
    } catch (err) {
      console.log('Error fetching reports:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNearbyReports();
    }, [])
  );

  const markers = reports.map((r) => ({
    latLng: [r.location.coordinates[1], r.location.coordinates[0]],
    title: `${r.category.toUpperCase()}: ${r.description}`,
    icon: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  }));

  if (selectedLocation) {
    markers.push({
      latLng: [selectedLocation.lat, selectedLocation.lng],
      title: 'New Report Location',
      icon: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Leaflet
        mapLayers={[
          {
            name: 'OpenStreetMap',
            src: TILE_URL,
            tileOptions: { attribution: '&copy; OpenStreetMap' },
          },
        ]}
        markers={markers}
        zoom={13}
        center={[12.95, 77.55]}
        onMapClick={(coords) => {
          setSelectedLocation({ lat: coords.latitude, lng: coords.longitude });
        }}
        style={styles.map}
      />

      {/* Top bar with My Reports + Logout */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.myReportsBtn}
          onPress={() => navigation.navigate('MyReports')}
        >
          <Text style={styles.myReportsText}>📋 My Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {selectedLocation && (
        <View style={styles.bottomBar}>
          <Text style={styles.coordText}>
            📍 {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
          </Text>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => navigation.navigate('ReportForm', { location: selectedLocation })}
          >
            <Text style={styles.reportButtonText}>Report Issue Here</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  myReportsBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    elevation: 3,
  },
  myReportsText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    elevation: 3,
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  coordText: { textAlign: 'center', marginBottom: 12, fontSize: 14, color: '#333' },
  reportButton: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});