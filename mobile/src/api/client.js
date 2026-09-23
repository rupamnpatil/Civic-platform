import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️⚠️⚠️ REPLACE THIS WITH YOUR COMPUTER'S IP ⚠️⚠️⚠️
// Run `ipconfig` on Windows or `ifconfig` on Mac/Linux to find it.
export const SERVER_URL = 'http://192.168.1.2:5000';
export const API_URL = `${SERVER_URL}/api`;

const client = axios.create({
  baseURL: API_URL,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;