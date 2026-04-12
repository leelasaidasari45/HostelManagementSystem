import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { HostelProvider } from './src/context/HostelContext';
import { Theme } from './src/styles/theme';

import LoginScreen from './src/screens/Auth/LoginScreen';
import TenantDashboard from './src/screens/Dashboard/TenantDashboard';
import OwnerOverview from './src/screens/Owner/OwnerOverview';
import RoomsScreen from './src/screens/Owner/RoomsScreen';
import TenantsScreen from './src/screens/Owner/TenantsScreen';
import ComplaintsScreen from './src/screens/Owner/ComplaintsScreen';
import { Home, Layers, Users, MessageSquare } from 'lucide-react-native';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const OwnerNavigator = () => (
  <Drawer.Navigator 
    screenOptions={{
      headerStyle: { backgroundColor: Theme.colors.background, shadowColor: 'transparent', borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
      headerTintColor: '#fff',
      drawerStyle: { backgroundColor: Theme.colors.background, width: 280 },
      drawerActiveTintColor: '#fff',
      drawerActiveBackgroundColor: Theme.colors.primary,
      drawerInactiveTintColor: Theme.colors.textMuted,
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Drawer.Screen 
      name="Overview" 
      component={OwnerOverview} 
      options={{ drawerIcon: ({color}) => <Home size={20} color={color} /> }}
    />
    <Drawer.Screen 
      name="Rooms" 
      component={RoomsScreen} 
      options={{ drawerIcon: ({color}) => <Layers size={20} color={color} /> }}
    />
    <Drawer.Screen 
      name="Tenants" 
      component={TenantsScreen} 
      options={{ drawerIcon: ({color}) => <Users size={20} color={color} /> }}
    />
    <Drawer.Screen 
      name="Complaints" 
      component={ComplaintsScreen} 
      options={{ drawerIcon: ({color}) => <MessageSquare size={20} color={color} /> }}
    />
  </Drawer.Navigator>
);

import JoinHostel from './src/screens/Tenant/JoinHostel';
import { registerForPushNotificationsAsync, syncTokenWithBackend } from './src/utils/notificationManager';

const NavigationProvider = () => {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync().then(token => {
        if (token) syncTokenWithBackend(token);
      });
    }
  }, [user]);

  if (loading || showSplash) {
    return <MobileSplash />;
  }

  // Custom logic to handle tenant redirection if not in a hostel
  const getInitialRoute = () => {
    if (user.role === 'tenant' && !user.hostel_id) return 'JoinHostel';
    return user.role === 'owner' ? 'OwnerRoot' : 'TenantDashboard';
  };

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={user ? getInitialRoute() : 'Login'}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : user.role === 'owner' ? (
          <Stack.Screen name="OwnerRoot" component={OwnerNavigator} />
        ) : (
          <>
            <Stack.Screen name="TenantDashboard" component={TenantDashboard} />
            <Stack.Screen name="JoinHostel" component={JoinHostel} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <HostelProvider>
        <View style={styles.container}>
          <StatusBar style="light" />
          <NavigationProvider />
        </View>
      </HostelProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.background },
});
