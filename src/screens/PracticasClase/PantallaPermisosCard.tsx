import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
} from 'react-native';
import {
  PERMISSIONS,
  request,
  Permission,
} from 'react-native-permissions';

export default function PantallaPermisosCard() {
  const [camaraStatus, setCamaraStatus] = useState<string>('unknown');
  const [ubicacionStatus, setUbicacionStatus] = useState<string>('unknown');
  const [microfonoStatus, setMicrofonoStatus] = useState<string>('unknown');

  const getPermission = async (
    permissionType: Permission,
    setter: React.Dispatch<React.SetStateAction<string>>,
    nombre: string
  ) => {
    const result = await request(permissionType);
    setter(result);
    Alert.alert(`Permiso de ${nombre}`, `Estado: ${result}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Permisos React Native CLI</Text>

      <View
        style={[
          styles.card,
          { borderLeftColor: camaraStatus === 'granted' ? 'green' : '#ccc' },
        ]}
      >
        <Text>Cámara: {camaraStatus}</Text>
        <Button
          title="Solicitar Permiso Cámara"
          onPress={() =>
            getPermission(PERMISSIONS.ANDROID.CAMERA, setCamaraStatus, 'cámara')
          }
        />
      </View>

      <View
        style={[
          styles.card,
          { borderLeftColor: ubicacionStatus === 'granted' ? 'green' : '#ccc' },
        ]}
      >
        <Text>Ubicación: {ubicacionStatus}</Text>
        <Button
          title="Solicitar Permiso Ubicación"
          onPress={() =>
            getPermission(
              PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
              setUbicacionStatus,
              'ubicación'
            )
          }
        />
      </View>

      <View
        style={[
          styles.card,
          { borderLeftColor: microfonoStatus === 'granted' ? 'green' : '#ccc' },
        ]}
      >
        <Text>Micrófono: {microfonoStatus}</Text>
        <Button
          title="Solicitar Permiso Micrófono"
          onPress={() =>
            getPermission(
              PERMISSIONS.ANDROID.RECORD_AUDIO,
              setMicrofonoStatus,
              'micrófono'
            )
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ECEFF1',
  },
  title: {
    fontSize: 22,
    marginBottom: 25,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderRadius: 8,
    borderLeftColor: '#ccc',
},
});
