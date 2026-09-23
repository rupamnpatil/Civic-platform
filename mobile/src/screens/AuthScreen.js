import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../utils/theme';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      return Alert.alert('Missing details', 'Please fill in all fields.');
    }
    if (!isLogin && !name.trim()) {
      return Alert.alert('Missing details', 'Please enter your name.');
    }
    setLoading(true);
    try {
      if (isLogin) await login(email.trim().toLowerCase(), password);
      else await register(name.trim(), email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.top}>
          <View style={styles.mark}>
            <Text style={styles.markText}>RC</Text>
          </View>
          <Text style={styles.title}>Reality Check</Text>
          <Text style={styles.tagline}>Civic accountability, simplified</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>
            {isLogin ? 'Sign in' : 'Create your account'}
          </Text>

          {!isLogin && (
            <>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                placeholder="Jane Doe"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Sign in' : 'Create account'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switch}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? " : 'Already registered? '}
              <Text style={styles.switchLink}>
                {isLogin ? 'Sign up' : 'Sign in'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>v1.0 · Secure JWT Authentication</Text>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.primary },
  container: { flex: 1, padding: SPACING.xxl, justifyContent: 'center' },

  top: { alignItems: 'center', marginBottom: SPACING.xxxl },
  mark: {
    width: 64, height: 64, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg,
  },
  markText: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  title: {
    color: '#fff', fontSize: 28, fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    color: '#94A3B8', fontSize: 13, marginTop: 6, letterSpacing: 0.3,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  cardHeading: {
    fontSize: 20, fontWeight: '800', color: COLORS.text,
    marginBottom: SPACING.xl, letterSpacing: -0.3,
  },

  label: {
    fontSize: 11, fontWeight: '700', color: COLORS.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6,
  },
  input: {
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, padding: 14, fontSize: 15,
    color: COLORS.text, backgroundColor: COLORS.surfaceAlt,
    marginBottom: SPACING.lg,
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16, borderRadius: RADIUS.md,
    alignItems: 'center', marginTop: SPACING.sm,
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },

  switch: { marginTop: SPACING.xl, alignItems: 'center' },
  switchText: { color: COLORS.textSecondary, fontSize: 13 },
  switchLink: { color: COLORS.accent, fontWeight: '700' },

  footer: {
    textAlign: 'center', color: '#64748B',
    fontSize: 11, marginTop: SPACING.xxl, letterSpacing: 0.4,
  },
});