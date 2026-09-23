import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../utils/theme';

const CONTACTS = [
  { code: '01', name: 'Police', number: '100' },
  { code: '02', name: 'Ambulance', number: '108' },
  { code: '03', name: 'Fire Brigade', number: '101' },
  { code: '04', name: 'Women Helpline', number: '1091' },
  { code: '05', name: 'Child Helpline', number: '1098' },
  { code: '06', name: 'Mental Health', number: '080-46110007' },
  { code: '07', name: 'Animal Rescue', number: '1962' },
  { code: '08', name: 'Municipal', number: '1533' },
];

export default function EmergencyContactsScreen() {
  const call = (n) => Linking.openURL(`tel:${n}`);

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>EMERGENCY</Text>
        </View>
        <Text style={styles.title}>Quick Dial</Text>
        <Text style={styles.subtitle}>Tap any number to call directly</Text>
      </View>

      <View style={styles.list}>
        {CONTACTS.map((c) => (
          <TouchableOpacity
            key={c.name}
            style={styles.row}
            onPress={() => call(c.number)}
            activeOpacity={0.85}
          >
            <View style={styles.code}>
              <Text style={styles.codeText}>{c.code}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{c.name}</Text>
              <Text style={styles.number}>{c.number}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    paddingHorizontal: SPACING.xl, paddingTop: 60, paddingBottom: SPACING.xxl,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: RADIUS.sm, marginBottom: SPACING.md,
  },
  badgeText: { fontSize: 9, fontWeight: '900', color: COLORS.danger, letterSpacing: 1.2 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },

  list: { padding: SPACING.lg },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, padding: SPACING.lg,
    borderRadius: RADIUS.md, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  code: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceAlt, marginRight: SPACING.md,
    alignItems: 'center', justifyContent: 'center',
  },
  codeText: { fontSize: 12, fontWeight: '900', color: COLORS.textSecondary, letterSpacing: 0.5 },
  name: { fontSize: 14, fontWeight: '800', color: COLORS.text, letterSpacing: -0.1 },
  number: { fontSize: 12, color: COLORS.textMuted, marginTop: 3, fontWeight: '600' },
  arrow: { fontSize: 22, color: COLORS.textMuted, fontWeight: '300' },
});