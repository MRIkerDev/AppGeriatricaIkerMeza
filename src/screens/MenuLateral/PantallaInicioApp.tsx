// PantallaInicioApp.tsx
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';

const PantallaInicioApp = ({ navigation }: any) => {
  const [, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      navigation.navigate('Inicio');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.splashContainer}>
      <Image
        source={require('../assets/splash.png')}
        style={styles.splashImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  splashImage: {
    width: 250,
    height: 250,
  },
});

export default PantallaInicioApp;
