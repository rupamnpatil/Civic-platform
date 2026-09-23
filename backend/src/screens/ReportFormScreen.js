import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import client from '../api/client';

const CATEGORIES = ['pothole', 'streetlight', 'sanitation', 'water', 'other'];

export default function ReportFormScreen({ route, navigation }) {
  const { location } = route.params;
  const [category, setCategory] = useState('pothole');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'We need access to your photos to attach evidence.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'We need camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Missing info', 'Please describe the issue.');
      return;
    }
    if (!image) {
      Alert.alert('Missing photo', 'Please attach a photo of the issue.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri: image.uri,
        name: 'report.jpg',
        type: 'image/jpeg',
      });
      formData.append('category', category);
      formData.append('description', description);
      formData.append('lng', String(location.lng));
      formData.append('lat', String(location.lat));
      formData.append('address', address);

      const res = await client.post('/reports', formData);

      if (res.data.merged) {
        Alert.alert('Duplicate Found', res.data.message);
      } else {
        Alert.alert('Success', 'Report submitted! Thank you for helping your city.');
      }
      navigation.goBack();
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Location</Text>
      <Text style={styles.coords}>
        📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
      </Text>

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryRow}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, category === c && styles.chipActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the issue..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Address (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. MG Road, near signal"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>Photo Evidence</Text>
      {image && <Image source={{ uri: image.uri }} style={styles.preview} />}
      <View style={styles.photoRow}>
        <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
          <Text style={styles.photoBtnText}>📷 Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
          <Text style={styles.photoBtnText}>🖼️ Gallery</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.submit, submitting && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
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
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 60 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 16, marginBottom: 8 },
  coords: { fontSize: 16, color: '#2563eb', fontWeight: '600' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { color: '#555', fontSize: 13, textTransform: 'capitalize' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  photoRow: { flexDirection: 'row', gap: 10 },
  photoBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
    alignItems: 'center',
  },
  photoBtnText: { color: '#2563eb', fontWeight: '600' },
  submit: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 28,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});