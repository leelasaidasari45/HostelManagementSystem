import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Theme, globalStyles } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Loader2 } from 'lucide-react-native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.gradient}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.logoText}>EasyPG</Text>
            <Text style={styles.subtitle}>Management System</Text>
          </View>

          <View style={globalStyles.glassPanel}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Login to manage your hostel stay</Text>

            <View style={styles.inputGroup}>
              <Mail size={20} color={Theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={Theme.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Lock size={20} color={Theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Theme.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.loginBtn, loading && styles.disabledBtn]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={24} color="#fff" style={styles.spinner} />
              ) : (
                <Text style={styles.loginBtnText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: Theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: {
    color: Theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  formTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  formSubtitle: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    marginBottom: Theme.spacing.lg,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
  },
  inputIcon: { marginRight: Theme.spacing.sm },
  input: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  loginBtn: {
    backgroundColor: Theme.colors.primary,
    height: 50,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
  },
  disabledBtn: { opacity: 0.7 },
  loginBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
