'use client';

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PantallaCerrarSesion = ({ navigation }: any) => {
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatosDoctor = async () => {
      try {
        const doctorId = await AsyncStorage.getItem('doctor_id');
        const nombreDoctor = await AsyncStorage.getItem('doctor_nombre');
        const correoDoctor = await AsyncStorage.getItem('doctor_correo');

        if (doctorId && nombreDoctor && correoDoctor) {
          setDoctor({
            id: doctorId,
            nombre: nombreDoctor,
            correo: correoDoctor,
          });
        }
      } catch (error) {
        console.log('Error al cargar datos del doctor:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosDoctor();
  }, []);

  const cerrarSesion = async () => {
    try {
      await AsyncStorage.multiRemove(['doctor_id', 'doctor_nombre', 'doctor_correo']);
      navigation.reset({
        index: 0,
        routes: [{ name: 'PantallaInicioSesion' }],
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
        <ActivityIndicator size="large" color="#4D96FF" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil Médico</Text>
      </View>

      {doctor ? (
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{doctor.nombre.charAt(0)}</Text>
          </View>

          <Text style={styles.doctorName}>{doctor.nombre}</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="key" size={20} color="#0A2463" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>ID:</Text>
              <Text style={styles.infoValue}>{doctor.id}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color="#0A2463" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Nombre:</Text>
              <Text style={styles.infoValue}>{doctor.nombre}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color="#0A2463" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Correo:</Text>
              <Text style={styles.infoValue}>{doctor.correo}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={cerrarSesion} activeOpacity={0.8}>
            <Ionicons name="log-out" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <Ionicons name="alert-circle" size={48} color="#0A2463" style={{ marginBottom: 16 }} />
          <Text style={styles.noDataText}>No hay datos del doctor disponibles.</Text>
          <TouchableOpacity
            style={styles.returnButton}
            onPress={() => navigation.navigate('PantallaInicioSesion')}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.returnButtonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <Ionicons name="medical" size={16} color="#3E4C59" style={{ marginBottom: 4 }} />
        <Text style={styles.footerText}>App Geriátrica v1.0</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
  },
  loadingText: {
    marginTop: 10,
    color: '#0A2463',
    fontSize: 16,
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
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4D96FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A2463',
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A2463',
    width: 80,
  },
  infoValue: {
    fontSize: 16,
    color: '#3E4C59',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    width: '100%',
  },
  logoutButton: {
    backgroundColor: '#E63946',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 18,
    color: '#3E4C59',
    marginBottom: 20,
    textAlign: 'center',
  },
  returnButton: {
    backgroundColor: '#4D96FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  returnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#3E4C59',
    fontSize: 12,
  },
});

export default PantallaCerrarSesion;
