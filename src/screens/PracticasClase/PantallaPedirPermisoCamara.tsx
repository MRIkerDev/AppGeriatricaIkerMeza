import React from 'react';
import {
    Alert,
  Button,
  PermissionsAndroid,
  StatusBar,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const requestCameraPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Permiso para usar la cámara',
        message:
          'La aplicación necesita acceder a tu cámara para tomar fotografías.',
        buttonNeutral: 'Preguntar después',
        buttonNegative: 'Cancelar',
        buttonPositive: 'OK',
      }
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Permiso concedido: puedes usar la cámara');
      Alert.alert('Permiso concedido', 'Puedes usar la cámara');
    } else {
      console.log('Permiso denegado: no puedes usar la cámara');
      Alert.alert('Permiso denegado', 'No puedes usar la cámara');
    }
  } catch (err) {
    console.warn('Error solicitando permiso:', err);
  }
};

const PantallaPedirPermisoCamara = () => (
  <SafeAreaProvider>
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Probar permisos</Text>
      <Button title="Solicitar permiso de cámara" onPress={requestCameraPermission} />
    </SafeAreaView>
  </SafeAreaProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: StatusBar.currentHeight,
    backgroundColor: '#ecf0f1',
    padding: 16,
  },
  title: {
    marginBottom: 24,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PantallaPedirPermisoCamara;
