import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/utils/theme';

import AuthScreen from './src/screens/AuthScreen';
import MapScreen from './src/screens/MapScreen';
import ReportFormScreen from './src/screens/ReportFormScreen';
import MyReportsScreen from './src/screens/MyReportsScreen';
import AdminMobileScreen from './src/screens/AdminMobileScreen';
import FeedScreen from './src/screens/FeedScreen';
import RewardsScreen from './src/screens/RewardsScreen';
import AnnouncementsScreen from './src/screens/AnnouncementsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ReportDetailScreen from './src/screens/ReportDetailScreen';
import EmergencyContactsScreen from './src/screens/EmergencyContactsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const NavTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: COLORS.bg },
};

const TAB_ICON = {
  Feed: '⌂',
  MapTab: '◎',
  Rewards: '★',
  Alerts: '◇',
  Profile: '☰',
};

function TabIcon({ route, focused }) {
  return (
    <Text
      style={{
        fontSize: focused ? 22 : 20,
        color: focused ? COLORS.primary : COLORS.textMuted,
        fontWeight: focused ? '700' : '500',
      }}
    >
      {TAB_ICON[route.name] || '•'}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon route={route} focused={focused} />,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.3,
          textTransform: 'uppercase',
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ tabBarLabel: 'Feed' }} />
      <Tab.Screen name="MapTab" component={MapScreen} options={{ tabBarLabel: 'Map' }} />
      <Tab.Screen name="Rewards" component={RewardsScreen} options={{ tabBarLabel: 'Rewards' }} />
      <Tab.Screen name="Alerts" component={AnnouncementsScreen} options={{ tabBarLabel: 'Alerts' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    );
  }

  if (user.role === 'admin') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminMobile" component={AdminMobileScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 16 },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ReportForm" component={ReportFormScreen} options={{ title: 'New Report' }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Report Details' }} />
      <Stack.Screen name="MyReports" component={MyReportsScreen} options={{ title: 'My Reports' }} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} options={{ title: 'Emergency' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer theme={NavTheme}>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}