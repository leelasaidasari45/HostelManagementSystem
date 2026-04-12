import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Theme, globalStyles } from '../../styles/theme';
import { Crown, Check, Zap, ShieldCheck, LogOut } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

const SelectPlanScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // AuthContext state update should trigger navigation back to Login via App.js
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/subscription/create-subscription');
      
      if (res.data.isMock) {
        Alert.alert('Success', 'Subscription setup initiated! (Mock Mode)');
        setTimeout(() => {
          navigation.navigate('OwnerRoot');
        }, 1500);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to initiate subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={handleLogout}
          >
            <LogOut size={18} color={Theme.colors.danger} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Crown size={40} color={Theme.colors.background} />
            </View>
            <Text style={styles.title}>
              The Future of {'\n'}
              <Text style={{ color: Theme.colors.primary }}>Hostel Management</Text>
            </Text>
            <Text style={styles.subtitle}>
              Start your 3-month free trial today. Experience elite automation.
            </Text>
          </View>

          <View style={[globalStyles.glassPanel, styles.planCard]}>
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>Premium SaaS</Text>
                <Text style={styles.planDesc}>Complete automation suite</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.currency}>₹</Text>
                <Text style={styles.price}>999</Text>
                <Text style={styles.duration}>/mo</Text>
              </View>
            </View>

            <View style={styles.trialBadge}>
              <Zap size={16} color={Theme.colors.primary} />
              <Text style={styles.trialText}>3 MONTHS FREE TRIAL</Text>
            </View>

            <View style={styles.features}>
              {[
                'Unlimited Hostels & Rooms',
                'QR-Based Instant Onboarding',
                'Automatic Rent Reminders',
                'Advanced Analytics & Reports',
                'Complaint Management'
              ].map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Check size={18} color={Theme.colors.primary} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.payBtn, loading && styles.disabledBtn]}
              onPress={handleSubscribe}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.payBtnText}>Set Up Autopay with Paytm</Text>
              )}
            </TouchableOpacity>

            <View style={styles.securityRow}>
              <ShieldCheck size={14} color={Theme.colors.textMuted} />
              <Text style={styles.securityText}>Secured by Paytm. Cancel anytime.</Text>
            </View>
          </View>

          <Text style={styles.footerNote}>
            By setting up Autopay, you agree to our Terms of Service. No charges will be made until your 3-month trial ends.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { padding: Theme.spacing.lg, alignItems: 'center' },
  logoutBtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    padding: 8,
  },
  logoutText: {
    color: Theme.colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  planCard: {
    width: '100%',
    padding: 24,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  planDesc: { fontSize: 13, color: Theme.colors.textMuted },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline' },
  currency: { color: Theme.colors.textMuted, fontSize: 16 },
  price: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  duration: { color: Theme.colors.textMuted, fontSize: 14 },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: 10,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    borderStyle: 'dashed',
    marginBottom: 20,
    gap: 8,
  },
  trialText: { color: Theme.colors.primary, fontWeight: 'bold', fontSize: 13 },
  features: { marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  featureText: { color: '#fff', fontSize: 15 },
  payBtn: {
    backgroundColor: Theme.colors.primary,
    height: 55,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: { opacity: 0.7 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  securityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 },
  securityText: { color: Theme.colors.textMuted, fontSize: 12 },
  footerNote: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});

export default SelectPlanScreen;
