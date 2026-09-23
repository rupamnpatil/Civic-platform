import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, Alert, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import client from '../api/client';
import { CATEGORIES } from '../utils/categories';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../utils/theme';

export default function ReportFormScreen({ route, navigation }) {
  const { location } = route.params;
  const [category, setCategory] = useState('pothole');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permission needed', 'Photo library access required.');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permission needed', 'Camera access required.');
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleSubmit = async () => {
    if (!description.trim()) return Alert.alert('Missing description', 'Please describe the issue.');
    if (!image) return Alert.alert('Missing photo', 'Please attach a photo.');

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('photo', { uri: image.uri, name: 'report.jpg', type: 'image/jpeg' });
      formData.append('category', category);
      formData.append('description', description);
      formData.append('lng', String(location.lng));
      formData.append('lat', String(location.lat));
      formData.append('address', address);

      const res = await client.post('/reports', formData);

      if (res.data.merged) {
        Alert.alert('Duplicate Detected', res.data.message);
      } else {
        Alert.alert('Report Submitted', 'You earned 10 civic points.');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.locationCard}>
        <Text style={styles.locationLabel}>Reported at</Text>
        <Text style={styles.locationCoords}>
          {location.lat.toFixed(5)}°, {location.lng.toFixed(5)}°
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Category</Text>
      <View style={styles.grid}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.catCard, category === c.id && styles.catCardActive]}
            onPress={() => setCategory(c.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.catEmoji}>{c.emoji}</Text>
            <Text
              style={[styles.catLabel, category === c.id && styles.catLabelActive]}
              numberOfLines={1}
            >
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Description</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Describe what you observed..."
        placeholderTextColor={COLORS.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.sectionTitle}>Address (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Landmark, street name"
        placeholderTextColor={COLORS.textMuted}
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.sectionTitle}>Evidence Photo</Text>
      {image && <Image source={{ uri: image.uri }} style={styles.preview} />}
      <View style={styles.photoRow}>
        <TouchableOpacity style={styles.photoBtn} onPress={takePhoto} activeOpacity={0.8}>
          <Text style={styles.photoBtnLabel}>Camera</Text>
          <Text style={styles.photoBtnHint}>Capture</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoBtn} onPress={pickImage} activeOpacity={0.8}>
          <Text style={styles.photoBtnLabel}>Gallery</Text>
          <Text style={styles.photoBtnHint}>Choose</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.submit, submitting && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.85}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Submit Report</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg, paddingBottom: 60 },

  locationCard: {
    backgroundColor: COLORS.surface, padding: SPACING.lg,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
    marginBottom: SPACING.lg, ...SHADOWS.sm,
  },
  locationLabel: {
    fontSize: 10, fontWeight: '800', color: COLORS.accent,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  locationCoords: {
    fontSize: 16, fontWeight: '700', color: COLORS.text,
    marginTop: 4, letterSpacing: -0.2,
  },

  sectionTitle: {
    fontSize: 11, fontWeight: '800', color: COLORS.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginTop: SPACING.lg, marginBottom: SPACING.md,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catCard: {
    width: '31.5%', paddingVertical: 12, paddingHorizontal: 6,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  catCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catEmoji: { fontSize: 20, marginBottom: 4 },
  catLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.textSecondary,
    textAlign: 'center', letterSpacing: 0.2,
  },
  catLabelActive: { color: '#fff' },

  input: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, padding: 14, fontSize: 14,
    color: COLORS.text, ...SHADOWS.sm,
  },
  textarea: { height: 100, textAlignVertical: 'top' },

  preview: {
    width: '100%', height: 200, borderRadius: RADIUS.md,
    marginBottom: SPACING.md, backgroundColor: COLORS.surfaceAlt,
  },
  photoRow: { flexDirection: 'row', gap: 10 },
  photoBtn: {
    flex: 1, paddingVertical: SPACING.lg, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  photoBtnLabel: { fontSize: 13, fontWeight: '800', color: COLORS.text, letterSpacing: 0.2 },
  photoBtnHint: {
    fontSize: 10, fontWeight: '700', color: COLORS.textMuted,
    marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.6,
  },

  submit: {
    backgroundColor: COLORS.primary, paddingVertical: 16,
    borderRadius: RADIUS.md, alignItems: 'center', marginTop: SPACING.xxl,
  },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
});