import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getHostAddress = () => {
  // If running in browser web preview
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    return window.location.hostname || 'localhost';
  }

  // Auto-detect PC IP from Metro dev server host (Expo Go on physical device)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }

  // Fallback to active LAN IP
  return '192.168.1.14';
};

export const SERVER_HOST = getHostAddress();
export const SERVER_URL = `http://${SERVER_HOST}:5000`;
export const API_URL = `${SERVER_URL}/api`;

const client = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds to allow smooth image uploads
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
