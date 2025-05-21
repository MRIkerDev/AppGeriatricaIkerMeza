'use client';

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { guardarDoctor, marcarDoctorComoSincronizado } from '../../database/database';
import { guardarDoctorFirebase } from '../../utils/firebaseService';
import { openDatabase } from '../../database/database';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PantallaInicioSesion = ({ navigation }: any) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [modoRegistro, setModoRegistro] = useState(false);

  const handleRegistrar = async () => {
    if (!nombre || !email || !contrasena) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }
    try {
      const doctor = { nombre, email, contrasena };
      const id = await guardarDoctor(doctor);
      await guardarDoctorFirebase({ id, ...doctor });
      marcarDoctorComoSincronizado(id);
      await AsyncStorage.setItem('doctor_id', id.toString());
      await AsyncStorage.setItem('doctor_nombre', doctor.nombre);
      await AsyncStorage.setItem('doctor_correo', doctor.email);
      navigation.navigate('PantallaPrincipal', { doctorId: id });
    } catch (error) {
      Alert.alert('Error al registrar doctor');
    }
  };

  const handleLogin = async () => {
    const db = await openDatabase();
    const [result] = await db.executeSql('SELECT * FROM doctores WHERE email = ? AND contrasena = ?', [
      email,
      contrasena,
    ]);
    if (result.rows.length > 0) {
      const doctor = result.rows.item(0);
      await AsyncStorage.setItem('doctor_id', doctor.id.toString());
      await AsyncStorage.setItem('doctor_nombre', doctor.nombre);
      await AsyncStorage.setItem('doctor_correo', doctor.email);
      navigation.navigate('PantallaPrincipal', { doctorId: doctor.id });
    } else {
      Alert.alert('Error', 'Credenciales inválidas');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.appTitle}>App Geriátrica</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.logoContainer}>
              <Ionicons name="medical" size={50} color="#ffffff" />
            </View>

            <Text style={styles.title}>{modoRegistro ? 'Registro de Doctor' : 'Inicio de Sesión'}</Text>

            {modoRegistro && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre completo</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={20} color="#0A2463" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Ingresa tu nombre"
                    style={styles.input}
                    value={nombre}
                    onChangeText={setNombre}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#0A2463" style={styles.inputIcon} />
                <TextInput
                  placeholder="ejemplo@correo.com"
                  style={styles.input}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#0A2463" style={styles.inputIcon} />
                <TextInput
                  placeholder="********"
                  style={styles.input}
                  secureTextEntry
                  value={contrasena}
                  onChangeText={setContrasena}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={modoRegistro ? handleRegistrar : handleLogin}
              activeOpacity={0.8}
            >
              <Ionicons
                name={modoRegistro ? 'person-add' : 'log-in'}
                size={20}
                color="#ffffff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.actionButtonText}>{modoRegistro ? 'Registrar' : 'Iniciar Sesión'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setModoRegistro(!modoRegistro)}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleText}>
                {modoRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Ionicons name="medical" size={16} color="#3E4C59" style={{ marginBottom: 4 }} />
            <Text style={styles.footerText}>App Geriátrica</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#0A2463',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
    marginTop: 20,
  },
  logoContainer: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4D96FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#0A2463',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#0A2463',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  actionButton: {
    backgroundColor: '#4D96FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: 20,
    padding: 10,
  },
  toggleText: {
    color: '#0A2463',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
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

export default PantallaInicioSesion;
