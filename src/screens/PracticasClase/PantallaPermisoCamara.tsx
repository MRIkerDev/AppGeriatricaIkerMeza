import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, Platform, StyleSheet } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const PantallaPermisoCamara = () => {
  const [permisoCamara, setPermisoCamara] = useState<string | null>(null);

  const solicitarPermisoCamara = async () => {
    const resultado = await request(
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.CAMERA
    );
    setPermisoCamara(resultado);

    switch (resultado) {
      case RESULTS.GRANTED:
        Alert.alert('Permiso concedido', 'Puedes usar la cámara.');
        break;
      case RESULTS.DENIED:
        Alert.alert('Permiso denegado', 'No podrás usar la cámara.');
        break;
      case RESULTS.BLOCKED:
        Alert.alert('Permiso bloqueado', 'Debes habilitarlo desde ajustes.');
        break;
      default:
        Alert.alert('Estado desconocido');
    }
  };

  useEffect(() => {
    const verificarPermiso = async () => {
      const resultado = await check(
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.CAMERA
          : PERMISSIONS.IOS.CAMERA
      );
      setPermisoCamara(resultado);
    };

    verificarPermiso();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Estado del permiso de cámara: {permisoCamara ?? 'Desconocido'}
      </Text>
      <Button title="Solicitar permiso de cámara" onPress={solicitarPermisoCamara} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  text: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
});

export default PantallaPermisoCamara;
