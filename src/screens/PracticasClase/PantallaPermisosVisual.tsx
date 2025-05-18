import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
  StyleSheet,
} from 'react-native';
import { check, request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const coloresPorEstado: Record<string, string> = {
  granted: '#4CAF50',     // Verde
  denied: '#FF9800',      // Naranja
  blocked: '#F44336',     // Rojo
  unavailable: '#9E9E9E', // Gris
};

const PantallaPermisosVisual = () => {
  const [camara, setCamara] = useState<string | null>(null);
  const [ubicacion, setUbicacion] = useState<string | null>(null);

  const abrirAjustes = () => {
    Linking.openSettings().catch(() =>
      Alert.alert('Error', 'No se pudo abrir ajustes del dispositivo.')
    );
  };

  const guardarPermiso = async (clave: string, valor: string) => {
    try {
      await AsyncStorage.setItem(clave, valor);
    } catch (error) {
      console.error('Error guardando en AsyncStorage:', error);
    }
  };

  const solicitarPermiso = async (
    permiso: Permission,
    setter: (estado: string) => void,
    clave: string
  ) => {
    const resultado = await request(permiso );
    setter(resultado);
    guardarPermiso(clave, resultado);

    if (resultado === RESULTS.BLOCKED) {
      Alert.alert('Permiso bloqueado', 'Debes habilitarlo desde ajustes.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir Ajustes', onPress: abrirAjustes },
      ]);
    }
  };

  const cargarPermisos = async () => {
    const permisoCam =
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.CAMERA;

    const permisoUbi =
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

    const estadoCam = await check(permisoCam);
    const estadoUbi = await check(permisoUbi);

    setCamara(estadoCam);
    setUbicacion(estadoUbi);

    guardarPermiso('permisoCamara', estadoCam);
    guardarPermiso('permisoUbicacion', estadoUbi);
  };

  useEffect(() => {
    cargarPermisos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>📱 Permisos de la App</Text>

      {/* Permiso de Cámara */}
      <View style={[styles.tarjeta, { borderColor: coloresPorEstado[camara || 'unavailable'] }]}>
        <Icon name="camera" size={30} color={coloresPorEstado[camara || 'unavailable']} />
        <Text style={styles.texto}>Cámara: {camara}</Text>
        <TouchableOpacity
          style={styles.boton}
          onPress={() =>
            solicitarPermiso(
              Platform.OS === 'android'
                ? PERMISSIONS.ANDROID.CAMERA
                : PERMISSIONS.IOS.CAMERA,
              setCamara,
              'permisoCamara'
            )
          }>
          <Text style={styles.botonTexto}>Solicitar</Text>
        </TouchableOpacity>
      </View>

      {/* Permiso de Ubicación */}
      <View style={[styles.tarjeta, { borderColor: coloresPorEstado[ubicacion || 'unavailable'] }]}>
        <Icon name="map-marker" size={30} color={coloresPorEstado[ubicacion || 'unavailable']} />
        <Text style={styles.texto}>Ubicación: {ubicacion}</Text>
        <TouchableOpacity
          style={styles.boton}
          onPress={() =>
            solicitarPermiso(
              Platform.OS === 'android'
                ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
                : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
              setUbicacion,
              'permisoUbicacion'
            )
          }>
          <Text style={styles.botonTexto}>Solicitar</Text>
        </TouchableOpacity>
      </View>

      {/* Ir a Ajustes */}
      <TouchableOpacity style={styles.botonAjustes} onPress={abrirAjustes}>
        <Icon name="cog-outline" size={20} color="#FFF" />
        <Text style={styles.botonAjustesTexto}>Abrir Ajustes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tarjeta: {
    padding: 15,
    marginVertical: 10,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  texto: {
    fontSize: 16,
    marginVertical: 10,
  },
  boton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botonTexto: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  botonAjustes: {
    flexDirection: 'row',
    backgroundColor: '#607D8B',
    padding: 12,
    borderRadius: 8,
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonAjustesTexto: {
    color: '#FFF',
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

export default PantallaPermisosVisual;
