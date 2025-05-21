'use client';

import { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Text, Animated, Easing, StatusBar, Dimensions, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const PantallaInicioApp = ({ navigation }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;

  const [, setLoadingProgress] = useState(0);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]),
      Animated.timing(loadingAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.cubic),
      }),
    ]).start();

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = prev + 0.05;
        if (newProgress >= 1) {
          clearInterval(interval);
          return 1;
        }
        return newProgress;
      });
    }, 100);

    const checkSesion = async () => {
      try {
        const doctorId = await AsyncStorage.getItem('doctor_id');
        setTimeout(() => {
          setIsCheckingSession(false);
          if (doctorId) {
            navigation.replace('PantallaPrincipal', { doctorId: Number.parseInt(doctorId) });
          } else {
            navigation.replace('PantallaInicioSesion');
          }
        }, 2000);
      } catch (error) {
        console.error('Error al verificar sesión:', error);
        setTimeout(() => {
          setIsCheckingSession(false);
          navigation.replace('PantallaInicioSesion');
        }, 2000);
      }
    };

    checkSesion();

    return () => clearInterval(interval);
  }, [fadeAnim, scaleAnim, translateYAnim, loadingAnim, navigation]);

  const progressWidth = loadingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.splashContainer}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />

      <View style={styles.backgroundGradient} />

      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />


      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          },
        ]}
      >
        <Image source={require('../screens/assets/splash.png')} style={styles.splashImage} resizeMode="contain" />

        <Text style={styles.appTitle}>App Geriátrica</Text>
        <Text style={styles.appTagline}>Cuidado especializado para adultos mayores</Text>


        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>


        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4D96FF" style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>
            {isCheckingSession ? 'Verificando sesion...' : 'Iniciando aplicacion...'}
          </Text>
        </View>
      </Animated.View>


      <View style={styles.footer}>
        <Text style={styles.footerText}>©App Geriátrica</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#0A2463',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  decorCircle1: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(77, 150, 255, 0.2)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: '20%',
    right: '5%',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(77, 150, 255, 0.1)',
  },
  contentContainer: {
    alignItems: 'center',
    width: width * 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  splashImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0A2463',
    marginBottom: 8,
    textAlign: 'center',
  },
  appTagline: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 30,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4D96FF',
    borderRadius: 3,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    marginRight: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default PantallaInicioApp;
