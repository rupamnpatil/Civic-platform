import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../utils/theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const MENU = [
    { label: 'My Reports', hint: 'View submission history', screen: 'MyReports' },
    { label: 'Rewards & Points', hint: 'Badges and leaderboard', screen: 'Rewards' },
    { label: 'Emergency Contacts', hint: 'Quick-dial helplines', screen: 'EmergencyContacts' },
  ];

  return (
    <ScrollView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.kicker}>Account</Text>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.chips}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{user?.role?.toUpperCase()}</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: COLORS.accentSoft }]}>
            <Text style={[styles.chipText, { color: COLORS.accent }]}>VERIFIED</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        {MENU.map((item, idx) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.row, idx !== MENU.length - 1 && styles.rowBorder]}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowHint}>{item.hint}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logout} onPress={logout} activeOpacity={0.85}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Reality Check · v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    paddingHorizontal: SPACING.xl, paddingTop: 60,
    paddingBottom: SPACING.xxl, backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  kicker: {
    fontSize: 10, fontWeight: '800', color: COLORS.accent,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: SPACING.lg,
  },
  identity: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '900' },
  name: { fontSize: 20, fontWeight: '800', color: COLORS.text, letterSpacing: -0.3 },
  email: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },

  chips: { flexDirection: 'row', gap: 6, marginTop: SPACING.lg },
  chip: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.sm,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  chipText: {
    fontSize: 10, fontWeight: '800',
    color: COLORS.textSecondary, letterSpacing: 0.8,
  },

  section: {
    margin: SPACING.lg, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden', ...SHADOWS.sm,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.lg,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  rowHint: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  arrow: { fontSize: 22, color: COLORS.textMuted, fontWeight: '300' },

  logout: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: SPACING.lg, alignItems: 'center',
  },
  logoutText: { color: COLORS.danger, fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },

  version: {
    textAlign: 'center', color: COLORS.textMuted,
    fontSize: 11, marginTop: SPACING.xxl, marginBottom: 40,
  },
});