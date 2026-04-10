import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/Auth/LoginScreen';
import TenantDashboard from './src/screens/Dashboard/TenantDashboard';
import { Theme } from './src/styles/theme';

const NavigationProvider = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  // Basic Routing Logic
  if (!user) {
    return <LoginScreen />;
  }

  // If user is a tenant, show Tenant Dashboard
  if (user.role === 'tenant') {
    return <TenantDashboard />;
  }

  // Placeholder for Owner Dashboard
  return (
    <View style={styles.centered}>
      <TenantDashboard /> 
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        <NavigationProvider />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
});
