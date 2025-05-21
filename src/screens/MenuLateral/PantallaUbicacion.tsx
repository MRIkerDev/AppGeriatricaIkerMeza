import { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Animated,
  Easing,
  Linking,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { magnetometer } from 'react-native-sensors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PantallaUbicacion = () => {
  // Estados para los datos del sensor y la ubicación
  const [magnetometro, setMagnetometro] = useState({ x: 0, y: 0, z: 0 });
  const [direccion, setDireccion] = useState(0);
  const [direccionTexto, setDireccionTexto] = useState('Norte');
  const [mapReady, setMapReady] = useState(false);
  const [permisoConcedido, setPermisoConcedido] = useState(false);
  const [cargandoPermiso, setCargandoPermiso] = useState(true);


  const rotateAnim = useRef(new Animated.Value(0)).current;

  const region = {
    latitude: 24.145653,
    longitude: -110.324926,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const mapRef = useRef<MapView | null>(null);


  const obtenerDireccionTexto = (grados: number) => {
    const direcciones = [
      { min: 0, max: 22.5, texto: 'Norte' },
      { min: 22.5, max: 67.5, texto: 'Noreste' },
      { min: 67.5, max: 112.5, texto: 'Este' },
      { min: 112.5, max: 157.5, texto: 'Sureste' },
      { min: 157.5, max: 202.5, texto: 'Sur' },
      { min: 202.5, max: 247.5, texto: 'Suroeste' },
      { min: 247.5, max: 292.5, texto: 'Oeste' },
      { min: 292.5, max: 337.5, texto: 'Noroeste' },
      { min: 337.5, max: 360, texto: 'Norte' },
    ];

    for (const dir of direcciones) {
      if (grados >= dir.min && grados < dir.max) {
        return dir.texto;
      }
    }
    return 'Norte';
  };

  // Solicitar permisos y configurar el magnetómetro
  useEffect(() => {
    const solicitarPermiso = async () => {
      try {
        setCargandoPermiso(true);
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BODY_SENSORS, {
            title: 'Permiso para el Magnetómetro',
            message: 'Necesitamos acceso al magnetómetro para mostrar la brújula',
            buttonPositive: 'Aceptar',
          });
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert(
              'Permiso Denegado',
              'No se podrá mostrar la brújula sin acceso al magnetómetro. Algunas funciones estarán limitadas.',
              [{ text: 'Entendido' }],
            );
            setPermisoConcedido(false);
          } else {
            setPermisoConcedido(true);
          }
        } else {
          // En iOS asumimos que el permiso está concedido
          setPermisoConcedido(true);
        }
      } catch (error) {
        console.error('Error al solicitar permiso:', error);
        setPermisoConcedido(false);
      } finally {
        setCargandoPermiso(false);
      }
    };

    solicitarPermiso();
  }, []);

  // Configurar el magnetómetro cuando se concede el permiso
  useEffect(() => {
    let subscription: any = null;

    if (permisoConcedido) {
      subscription = magnetometer.subscribe(
        ({ x, y, z }) => {
          setMagnetometro({ x, y, z });

          // Calcular la dirección en grados
          const angulo = Math.atan2(y, x) * (180 / Math.PI);
          const direccionGrados = angulo >= 0 ? angulo : angulo + 360;
          const gradosRedondeados = Number.parseFloat(direccionGrados.toFixed(0));

          setDireccion(gradosRedondeados);
          setDireccionTexto(obtenerDireccionTexto(gradosRedondeados));

          // Animar la rotación de la brújula
          Animated.timing(rotateAnim, {
            toValue: -gradosRedondeados, // Negativo para que gire en la dirección correcta
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
        },
        (error) => {
          console.error('Error en el magnetómetro:', error);
          Alert.alert(
            'Error del Sensor',
            'No se pudo acceder al magnetómetro. La brújula no funcionará correctamente.',
            [{ text: 'Entendido' }],
          );
        },
      );
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [permisoConcedido, rotateAnim]);


  const centrarEnMarcador = () => {
    mapRef.current?.animateToRegion(region, 1000);
  };

  const abrirDirecciones = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${region.latitude},${region.longitude}&travelmode=driving`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se puede abrir Google Maps');
      }
    });
  };

  // Transformación para la animación de rotación
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ubicación y Brújula</Text>
      </View>

      <View style={styles.mapContainer}>
        {!mapReady && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4D96FF" />
            <Text style={styles.loadingText}>Cargando mapa...</Text>
          </View>
        )}

        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
          showsCompass={true}
          showsScale={true}
          showsBuildings={true}
          onMapReady={() => setMapReady(true)}
        >
          <Marker
            coordinate={{ latitude: region.latitude, longitude: region.longitude }}
            title={'Centro Geriátrico Dr. Oscar Prado'}
            description={'Ubicado en La Paz, Baja California Sur'}
            pinColor="#4D96FF"
          >
            <View style={styles.customMarker}>
              <Ionicons name="medical" size={24} color="#fff" />
            </View>
          </Marker>
        </MapView>

        {/* Controles del mapa */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapControlButton} onPress={centrarEnMarcador} activeOpacity={0.8}>
            <Ionicons name="locate" size={24} color="#0A2463" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.mapControlButton} onPress={abrirDirecciones} activeOpacity={0.8}>
            <Ionicons name="navigate" size={24} color="#0A2463" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoHeader}>
          <Ionicons name="compass" size={22} color="#0A2463" style={styles.infoIcon} />
          <Text style={styles.infoTitle}>Brújula Digital</Text>
        </View>

        <View style={styles.compassContainer}>
          {cargandoPermiso ? (
            <ActivityIndicator size="large" color="#4D96FF" />
          ) : permisoConcedido ? (
            <>
              <View style={styles.compassBackground}>
                <View style={styles.compassDirections}>
                  <Text style={[styles.compassDirection, styles.compassN]}>N</Text>
                  <Text style={[styles.compassDirection, styles.compassE]}>E</Text>
                  <Text style={[styles.compassDirection, styles.compassS]}>S</Text>
                  <Text style={[styles.compassDirection, styles.compassW]}>O</Text>
                </View>
                <Animated.View
                  style={[
                    styles.compassNeedle,
                    {
                      transform: [{ rotate }],
                    },
                  ]}
                >
                  <View style={styles.needleNorth} />
                  <View style={styles.needleSouth} />
                </Animated.View>
                <View style={styles.compassCenter} />
              </View>

              <View style={styles.directionInfo}>
                <Text style={styles.directionDegrees}>{direccion}°</Text>
                <Text style={styles.directionText}>{direccionTexto}</Text>
              </View>
            </>
          ) : (
            <View style={styles.permisoContainer}>
              <Ionicons name="warning" size={40} color="#F59E0B" />
              <Text style={styles.permisoText}>Se requiere permiso para el magnetómetro para mostrar la brújula.</Text>
              <TouchableOpacity
                style={styles.permisoButton}
                onPress={() => {
                  Linking.openSettings();
                }}
              >
                <Text style={styles.permisoButtonText}>Abrir Configuración</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {permisoConcedido && (
          <View style={styles.magnetometerData}>
            <Text style={styles.magnetometerTitle}>Datos del Magnetómetro:</Text>
            <View style={styles.magnetometerValues}>
              <View style={styles.magnetometerValue}>
                <Text style={styles.magnetometerLabel}>X:</Text>
                <Text style={styles.magnetometerNumber}>{magnetometro.x.toFixed(2)}</Text>
              </View>
              <View style={styles.magnetometerValue}>
                <Text style={styles.magnetometerLabel}>Y:</Text>
                <Text style={styles.magnetometerNumber}>{magnetometro.y.toFixed(2)}</Text>
              </View>
              <View style={styles.magnetometerValue}>
                <Text style={styles.magnetometerLabel}>Z:</Text>
                <Text style={styles.magnetometerNumber}>{magnetometro.z.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.locationInfo}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color="#4D96FF" style={styles.locationIcon} />
            <Text style={styles.locationText}>Centro Geriátrico Dr. Oscar Prado</Text>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="map" size={18} color="#4D96FF" style={styles.locationIcon} />
            <Text style={styles.locationText}>La Paz, Baja California Sur</Text>
          </View>
          <TouchableOpacity style={styles.directionsButton} onPress={abrirDirecciones} activeOpacity={0.8}>
            <Ionicons name="navigate-circle" size={20} color="#fff" style={styles.directionsIcon} />
            <Text style={styles.directionsText}>Obtener Indicaciones</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  header: {
    backgroundColor: '#0A2463',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mapContainer: {
    height: '40%',
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    color: '#4B5563',
    fontSize: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarker: {
    backgroundColor: '#4D96FF',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fff',
  },
  mapControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'column',
  },
  mapControlButton: {
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  infoContainer: {
    flex: 1,
    margin: 16,
    marginTop: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoIcon: {
    marginRight: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2463',
  },
  compassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    height: 180,
  },
  compassBackground: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  compassDirections: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  compassDirection: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  compassN: {
    top: 5,
    left: '47%',
    color: '#4D96FF',
  },
  compassE: {
    right: 5,
    top: '47%',
  },
  compassS: {
    bottom: 5,
    left: '47%',
  },
  compassW: {
    left: 5,
    top: '47%',
  },
  compassNeedle: {
    width: 4,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  needleNorth: {
    width: 4,
    height: 65,
    backgroundColor: '#4D96FF',
  },
  needleSouth: {
    width: 4,
    height: 65,
    backgroundColor: '#E63946',
  },
  compassCenter: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  directionInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  directionDegrees: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A2463',
  },
  directionText: {
    fontSize: 16,
    color: '#4B5563',
  },
  permisoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  permisoText: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#4B5563',
  },
  permisoButton: {
    backgroundColor: '#4D96FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  permisoButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  magnetometerData: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  magnetometerTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  magnetometerValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  magnetometerValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  magnetometerLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  magnetometerNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  locationInfo: {
    marginTop: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#4B5563',
  },
  directionsButton: {
    backgroundColor: '#4D96FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  directionsIcon: {
    marginRight: 8,
  },
  directionsText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default PantallaUbicacion;
