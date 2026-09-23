import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ REPLACE 192.168.1.5 WITH YOUR COMPUTER'S IP ADDRESS
const BASE_URL = 'http://192.168.1.2:5000/api';

const client = axios.create({
  baseURL: BASE_URL,
});

// Automatically attach the token to every request
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;