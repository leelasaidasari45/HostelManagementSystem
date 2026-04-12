import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image, Alert } from 'react-native';
import { Theme, globalStyles } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, Briefcase, Loader2, ArrowLeft } from 'lucide-react-native';
import apiClient from '../../api/apiClient';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'tenant'
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Missing Info', 'Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', "Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/register', formData);
      Alert.alert('Success', 'Registration successful! Please login.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Check your details or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.gradient}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Image 
              source={{ uri: 'https://i.pinimg.com/736x/1d/31/58/1d315807fbdbf074612825fcdaa7c9b8.jpg' }} 
              style={styles.logo} 
            />
            <Text style={styles.logoText}>easyPG</Text>
            <Text style={styles.subtitle}>Join the ecosystem</Text>
          </View>

          <View style={globalStyles.glassPanel}>
            <Text style={styles.formTitle}>Create Account</Text>
            
            <View style={styles.inputGroup}>
              <User size={20} color={Theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={Theme.colors.textMuted}
                value={formData.name}
                onChangeText={(val) => setFormData({...formData, name: val})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Mail size={20} color={Theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={Theme.colors.textMuted}
                value={formData.email}
                onChangeText={(val) => setFormData({...formData, email: val})}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Lock size={20} color={Theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Theme.colors.textMuted}
                value={formData.password}
                onChangeText={(val) => setFormData({...formData, password: val})}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Lock size={20} color={Theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={Theme.colors.textMuted}
                value={formData.confirmPassword}
                onChangeText={(val) => setFormData({...formData, confirmPassword: val})}
                secureTextEntry
              />
            </View>

            {/* Role Toggle */}
            <View style={styles.roleContainer}>
                <TouchableOpacity 
                    style={[styles.roleBtn, formData.role === 'tenant' && styles.roleBtnActive]}
                    onPress={() => setFormData({...formData, role: 'tenant'})}
                >
                    <User size={16} color={formData.role === 'tenant' ? '#fff' : Theme.colors.textMuted} />
                    <Text style={[styles.roleText, formData.role === 'tenant' && styles.roleTextActive]}>Tenant</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.roleBtn, formData.role === 'owner' && styles.roleBtnActive]}
                    onPress={() => setFormData({...formData, role: 'owner'})}
                >
                    <Briefcase size={16} color={formData.role === 'owner' ? '#fff' : Theme.colors.textMuted} />
                    <Text style={[styles.roleText, formData.role === 'owner' && styles.roleTextActive]}>Owner</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.registerBtn, loading && styles.disabledBtn]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={24} color="#fff" />
              ) : (
                <Text style={styles.registerBtnText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerText}>Already have an account? <Text style={styles.loginLink}>Login</Text></Text>
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
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 15,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  formTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
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
  roleContainer: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: Theme.spacing.md,
  },
  roleBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: 45,
      borderRadius: Theme.borderRadius.md,
      borderWidth: 1,
      borderColor: Theme.colors.border,
      backgroundColor: 'rgba(255,255,255,0.02)',
  },
  roleBtnActive: {
      backgroundColor: Theme.colors.primary,
      borderColor: Theme.colors.primary,
  },
  roleText: { color: Theme.colors.textMuted, fontWeight: '600' },
  roleTextActive: { color: '#fff' },
  registerBtn: {
    backgroundColor: Theme.colors.primary,
    height: 55,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
  },
  disabledBtn: { opacity: 0.7 },
  registerBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: { marginTop: 20, alignItems: 'center' },
  footerText: { color: Theme.colors.textMuted },
  loginLink: { color: Theme.colors.primary, fontWeight: 'bold' },
});

export default RegisterScreen;
