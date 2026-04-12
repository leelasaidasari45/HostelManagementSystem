import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { Theme } from '../../styles/theme';

const MobileSplash = () => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Image 
          source={{ uri: 'https://i.pinimg.com/736x/1d/31/58/1d315807fbdbf074612825fcdaa7c9b8.jpg' }} 
          style={styles.logo} 
        />
      </Animated.View>
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>easyPG</Animated.Text>
      <Text style={styles.subtitle}>Premium Hostel Living</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    marginTop: 20,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default MobileSplash;
