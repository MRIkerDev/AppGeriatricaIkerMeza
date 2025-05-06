import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { magnetometer } from 'react-native-sensors';

const PantallaUbicacion = () => {
  const [magnetometro, setMagnetometro] = useState({ x: 0, y: 0, z: 0 });
  const [direccion, setDireccion] = useState(0);

  // Coordenadas del Centro Geriátrico en La Paz, BCS
  const region = {
    latitude: 24.1426,
    longitude: -110.3128,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  useEffect(() => {
    const solicitarPermiso = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BODY_SENSORS,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('Permiso de sensor no concedido');
          return;
        }
      }

      const subscription = magnetometer.subscribe(({ x, y, z }) => {
        setMagnetometro({ x, y, z });

        const angulo = Math.atan2(y, x) * (180 / Math.PI);
        const direccionGrados = angulo >= 0 ? angulo : angulo + 360;
        setDireccion(parseFloat(direccionGrados.toFixed(0)));
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    solicitarPermiso();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ubicación del Centro Geriátrico</Text>

      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
      >
        <Marker
          coordinate={{ latitude: 24.1426, longitude: -110.3128 }}
          title={'Centro Geriátrico Dr. Oscar Prado'}
          description={'Ubicado en La Paz, Baja California Sur'}
        />
      </MapView>

      <View style={styles.info}>
        <Text style={styles.heading}>Datos del Magnetometro</Text>
        <Text>X: {magnetometro.x.toFixed(2)} | Y: {magnetometro.y.toFixed(2)} | Z: {magnetometro.z.toFixed(2)}</Text>
        <Text>Dirección estimada: {direccion}°</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  map: {
    flex: 1,
  },
  info: {
    padding: 15,
    backgroundColor: '#f1f1f1',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
});

export default PantallaUbicacion;
