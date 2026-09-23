import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  TextInput, FlatList, Keyboard, StatusBar, Alert, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import LeafletMap from '../components/LeafletMap';
import client from '../api/client';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../utils/theme';

const DEFAULT_CENTER = [12.95, 77.55];

export default function MapScreen({ navigation }) {
  const { user } = useAuth();
  const mapRef = useRef(null);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  // ── On mount: request location ─────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          fetchNearbyReports(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        setUserLocation(coords);
        setMapCenter([coords.lat, coords.lng]);

        setTimeout(() => {
          mapRef.current?.setUserLocation(coords.lat, coords.lng);
          mapRef.current?.recenter(coords.lat, coords.lng, 15);
        }, 600);

        fetchNearbyReports(coords.lat, coords.lng);
      } catch (err) {
        console.log('Location error:', err.message);
        fetchNearbyReports(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
      }
    })();
  }, []);

  const fetchNearbyReports = async (lat, lng) => {
    try {
      const res = await client.get(`/reports/nearby?lat=${lat}&lng=${lng}&radius=50000`);
      setReports(res.data.reports || []);
    } catch (err) {
      console.log('Nearby error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Debounced auto-search via Photon ────────────────────
  const searchPhoton = async (text) => {
    if (!text || text.trim().length < 3) {
      setResults([]);
      setSearched(false);
      return;
    }
    setSearching(true);
    setSearched(true);
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=8&lang=en`;
      const res = await fetch(url);
      const json = await res.json();
      const features = json?.features || [];

      const mapped = features.map((f) => {
        const props = f.properties || {};
        const [lng, lat] = f.geometry?.coordinates || [0, 0];
        const parts = [
          props.name,
          props.street,
          props.district,
          props.city,
          props.state,
          props.country,
        ].filter(Boolean);
        return {
          id: `${props.osm_type || 'x'}-${props.osm_id || Math.random()}`,
          label: parts.join(', '),
          lat,
          lng,
        };
      });
      setResults(mapped);
    } catch (err) {
      console.log('Photon search error:', err.message);
      Alert.alert('Search unavailable', 'Check your internet connection.');
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const onChangeQuery = (text) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPhoton(text), 500);
  };

  const selectResult = (item) => {
    setMapCenter([item.lat, item.lng]);
    mapRef.current?.recenter(item.lat, item.lng, 16);
    closeSearch();
  };

  const openSearch = () => {
    setSearchOpen(true);
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  const closeSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    Keyboard.dismiss();
    setSearchOpen(false);
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  const goToMyLocation = () => {
    if (!userLocation) {
      Alert.alert('Location unavailable', 'Enable location services to use this.');
      return;
    }
    mapRef.current?.recenter(userLocation.lat, userLocation.lng, 16);
    mapRef.current?.setUserLocation(userLocation.lat, userLocation.lng);
  };

  const markers = reports.map((r) => ({
    latLng: [r.location.coordinates[1], r.location.coordinates[0]],
    title: `${r.category.toUpperCase()}: ${r.description}`,
  }));

  if (selectedLocation) {
    markers.push({
      latLng: [selectedLocation.lat, selectedLocation.lng],
      title: 'New report location',
    });
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : (
        <LeafletMap
          markers={markers}
          center={mapCenter}
          zoom={14}
          mapRef={mapRef}
          onMapClick={(c) => setSelectedLocation({ lat: c.lat, lng: c.lng })}
        />
      )}

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.85} onPress={openSearch}>
          <Text style={styles.searchIcon}>⌕</Text>
          <Text style={styles.searchPlaceholder}>Search a place or address</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate('MyReports')}
        >
          <Text style={styles.iconText}>≡</Text>
        </TouchableOpacity>
      </View>

      {/* Locate me */}
      <TouchableOpacity style={styles.locateBtn} onPress={goToMyLocation}>
        <View style={styles.locateRing}>
          <View style={styles.locateDot} />
        </View>
      </TouchableOpacity>

      {/* Hint pill */}
      {!selectedLocation && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>Tap anywhere on the map to report an issue</Text>
        </View>
      )}

      {/* Pin-drop bottom sheet */}
      {selectedLocation && (
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetLabel}>Selected Location</Text>
          <Text style={styles.sheetCoords}>
            {selectedLocation.lat.toFixed(5)}°, {selectedLocation.lng.toFixed(5)}°
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ReportForm', { location: selectedLocation })}
          >
            <Text style={styles.primaryBtnText}>Report Issue Here</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setSelectedLocation(null)} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Full-screen search modal ── */}
      <Modal
        visible={searchOpen}
        animationType="slide"
        onRequestClose={closeSearch}
        presentationStyle="fullScreen"
        statusBarTranslucent
      >
        <SafeAreaView style={styles.modalRoot} edges={['top']}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Header */}
            <View style={styles.searchHeader}>
              <View style={styles.searchInputWrap}>
                <Text style={styles.searchIconInline}>⌕</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search for a place..."
                  placeholderTextColor={COLORS.textMuted}
                  value={query}
                  onChangeText={onChangeQuery}
                  autoFocus
                  returnKeyType="search"
                  onSubmitEditing={() => searchPhoton(query)}
                  autoCorrect={false}
                  autoCapitalize="words"
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={() => onChangeQuery('')} hitSlop={10}>
                    <Text style={styles.clearBtn}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity onPress={closeSearch} hitSlop={10}>
                <Text style={styles.cancelBtn}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Body */}
            {searching ? (
              <View style={styles.stateBox}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={styles.stateText}>Searching…</Text>
              </View>
            ) : !searched ? (
              <View style={styles.stateBox}>
                <Text style={styles.stateEmoji}>⌕</Text>
                <Text style={styles.stateTitle}>Find any place</Text>
                <Text style={styles.stateSub}>
                  Type at least 3 characters to search the map.
                </Text>
              </View>
            ) : results.length === 0 ? (
              <View style={styles.stateBox}>
                <Text style={styles.stateEmoji}>∅</Text>
                <Text style={styles.stateTitle}>No results found</Text>
                <Text style={styles.stateSub}>Try a different place name.</Text>
              </View>
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={styles.resultsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.resultRow}
                    onPress={() => selectResult(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.resultIconBox}>
                      <Text style={styles.resultIconText}>◈</Text>
                    </View>
                    <Text style={styles.resultText} numberOfLines={2}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },

  topBar: {
    position: 'absolute', top: 50, left: SPACING.lg, right: SPACING.lg,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  searchIcon: { fontSize: 18, color: COLORS.textMuted, marginRight: 8 },
  searchPlaceholder: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },

  iconBtn: {
    width: 46, height: 46, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', ...SHADOWS.md,
  },
  iconText: { fontSize: 20, color: COLORS.text, fontWeight: '700' },

  locateBtn: {
    position: 'absolute', bottom: 90, right: SPACING.lg,
    width: 46, height: 46, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', ...SHADOWS.md,
  },
  locateRing: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  locateDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.accent,
  },

  hint: {
    position: 'absolute', bottom: 90, alignSelf: 'center',
    backgroundColor: COLORS.surface, paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  hintText: {
    fontSize: 11, fontWeight: '700',
    color: COLORS.textSecondary, letterSpacing: 0.2,
  },

  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface,
    padding: SPACING.xl, paddingTop: SPACING.md,
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    borderTopWidth: 1, borderColor: COLORS.border, ...SHADOWS.lg,
  },
  handle: {
    width: 36, height: 4, backgroundColor: COLORS.borderStrong,
    borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg,
  },
  sheetLabel: {
    fontSize: 10, fontWeight: '800', color: COLORS.accent,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
  },
  sheetCoords: {
    fontSize: 16, fontWeight: '700', color: COLORS.text,
    marginBottom: SPACING.xl, letterSpacing: -0.2,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary, paddingVertical: 16,
    borderRadius: RADIUS.md, alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  cancel: { paddingVertical: SPACING.md, alignItems: 'center', marginTop: 4 },
  cancelText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 13 },

  modalRoot: { flex: 1, backgroundColor: COLORS.bg },
  searchHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  searchInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt, paddingHorizontal: 12,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
  },
  searchIconInline: { fontSize: 16, color: COLORS.textMuted, marginRight: 6 },
  searchInput: {
    flex: 1, paddingVertical: 12, fontSize: 14,
    color: COLORS.text, fontWeight: '500',
  },
  clearBtn: { fontSize: 14, color: COLORS.textMuted, padding: 4 },
  cancelBtn: { color: COLORS.accent, fontSize: 13, fontWeight: '800' },

  resultsList: { padding: SPACING.lg },
  resultRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 8,
  },
  resultIconBox: {
    width: 32, height: 32, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accentSoft, marginRight: SPACING.md,
    alignItems: 'center', justifyContent: 'center',
  },
  resultIconText: { fontSize: 14, color: COLORS.accent, fontWeight: '800' },
  resultText: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 18, fontWeight: '600' },

  stateBox: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  stateEmoji: { fontSize: 40, color: COLORS.borderStrong, fontWeight: '200', marginBottom: 12 },
  stateTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  stateSub: {
    fontSize: 12, color: COLORS.textMuted, marginTop: 6,
    textAlign: 'center', lineHeight: 18,
  },
  stateText: { fontSize: 12, color: COLORS.textMuted, marginTop: 10, fontWeight: '600' },
});