// PantallaUbicacion.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const PantallaUbicacion = () => {
  // Coordenadas del Centro Geriátrico en La Paz, BCS
  const region = {
    latitude: 24.1426, // Latitud de La Paz
    longitude: -110.3128, // Longitud de La Paz
    latitudeDelta: 0.01, // Nivel de zoom vertical
    longitudeDelta: 0.01, // Nivel de zoom horizontal
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ubicación del Centro Geriátrico</Text>

      {/* Componente MapView para mostrar el mapa */}
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true} // Mostrar ubicación actual si se permite
      >
        {/* Marcador en el mapa */}
        <Marker
          coordinate={{ latitude: 24.1426, longitude: -110.3128 }}
          title={'Centro Geriátrico Dr. Oscar Prado'}
          description={'Ubicado en La Paz, Baja California Sur'}
        />
      </MapView>
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
});

export default PantallaUbicacion;
