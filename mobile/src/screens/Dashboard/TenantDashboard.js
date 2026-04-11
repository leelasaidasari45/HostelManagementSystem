import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Theme, globalStyles } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { Bell, LogOut, Home, IndianRupee, MessageSquare } from 'lucide-react-native';

const TenantDashboard = ({ navigation }) => {
  const { user, logout, updateUser } = useAuth();
  const [dashData, setDashData] = useState({ hostelName: '', notices: [], menu: null });
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await apiClient.get('/tenant/dashboard');
      
      // 🛑 Critical: If the user has been rejected or un-joined, send them to the Join screen
      if (res.data.tenant.status === 'rejected' || !res.data.tenant.hostel_id) {
          updateUser({ hostel_id: null, status: 'new' });
          navigation.reset({
            index: 0,
            routes: [{ name: 'JoinHostel' }],
          });
          return;
      }

      setDashData(res.data);
      updateUser(res.data.tenant); // Sync global state
    } catch (err) {
      console.log('Error fetching dashboard', err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome to</Text>
          <Text style={styles.hostelName}>{dashData.hostelName || 'Your Hostel'}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <LogOut size={20} color={Theme.colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />}
      >
        {/* Statistics Row (Mini Cards) */}
        <View style={styles.statsRow}>
          <View style={[globalStyles.glassPanel, styles.statCard]}>
            <Home size={20} color={Theme.colors.primary} />
            <Text style={styles.statLabel}>Room</Text>
            <Text style={styles.statValue}>{user?.roomNumber || 'N/A'}</Text>
          </View>
          <View style={[globalStyles.glassPanel, styles.statCard]}>
            <IndianRupee size={20} color="#22c55e" />
            <Text style={styles.statLabel}>Rent</Text>
            <Text style={styles.statValue}>Paid</Text>
          </View>
        </View>

        {/* Notices Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={Theme.colors.primary} />
            <Text style={styles.sectionTitle}>Recent Notices</Text>
          </View>
          {dashData.notices.length > 0 ? (
            dashData.notices.map((notice, idx) => (
              <View key={idx} style={[globalStyles.glassPanel, styles.noticeCard]}>
                <Text style={styles.noticeTitle}>{notice.title}</Text>
                <Text style={styles.noticeBody}>{notice.message}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>No new notices today.</Text>
          )}
        </View>

        {/* Food Menu Widget */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Home size={20} color={Theme.colors.primary} />
            <Text style={styles.sectionTitle}>Food Menu</Text>
          </View>
          <View style={globalStyles.glassPanel}>
            <View style={styles.menuItem}>
              <Text style={styles.menuLabel}>Breakfast:</Text>
              <Text style={styles.menuValue}>{dashData.menu?.breakfast || 'N/A'}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuLabel}>Lunch:</Text>
              <Text style={styles.menuValue}>{dashData.menu?.lunch || 'N/A'}</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={styles.menuLabel}>Dinner:</Text>
              <Text style={styles.menuValue}>{dashData.menu?.dinner || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Placeholder */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}><Home size={24} color={Theme.colors.primary} /></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><IndianRupee size={24} color={Theme.colors.textMuted} /></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><MessageSquare size={24} color={Theme.colors.textMuted} /></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    paddingTop: 60,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between'
  },
  welcome: { color: Theme.colors.textMuted, fontSize: 14 },
  hostelName: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  logoutBtn: { padding: 10, borderRadius: 50, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  scrollContent: { paddingHorizontal: Theme.spacing.lg, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: Theme.spacing.md, marginBottom: Theme.spacing.lg },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statLabel: { color: Theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  statValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  section: { marginBottom: Theme.spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Theme.spacing.md },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  noticeCard: { marginBottom: Theme.spacing.sm },
  noticeTitle: { color: Theme.colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  noticeBody: { color: Theme.colors.textMuted, fontSize: 14 },
  menuItem: { flexDirection: 'row', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 4 },
  menuLabel: { color: Theme.colors.textMuted, width: 80, fontSize: 14 },
  menuValue: { color: '#fff', flex: 1, fontSize: 14 },
  noData: { color: Theme.colors.textMuted, textAlign: 'center', fontStyle: 'italic' },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#111827',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
  },
  navItem: { padding: 10 },
});

export default TenantDashboard;
