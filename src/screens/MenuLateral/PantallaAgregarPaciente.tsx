'use client';

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { guardarPaciente, marcarPacienteComoSincronizado } from '../../database/database';
import { hayInternet } from '../../utils/checarInternet';
import { guardarPacienteFirebase } from '../../utils/firebaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PantallaAgregarPaciente = ({ navigation }: any) => {
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [enfermedades, setEnfermedades] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [lugarNacimiento, setLugarNacimiento] = useState('');
  const [estadoCivil, setEstadoCivil] = useState('');
  const [cuidador, setCuidador] = useState('');
  const [escolaridad, setEscolaridad] = useState('');
  const [ocupacion, setOcupacion] = useState('');

  const [tabaquismo, setTabaquismo] = useState(false);
  const [alcoholismo, setAlcoholismo] = useState(false);
  const [biomasa, setBiomasa] = useState(false);
  const [combe, setCombe] = useState(false);
  const [vacunas, setVacunas] = useState(false);
  const [cirugias, setCirugias] = useState(false);
  const [transfusiones, setTransfusiones] = useState(false);
  const [fracturas, setFracturas] = useState(false);
  const [alergias, setAlergias] = useState(false);

  const handleRegistrarPaciente = async () => {
    if (!nombre || !edad) {
      Alert.alert('Error', 'Por favor ingrese nombre y edad');
      return;
    }

    try {
      const doctorId = await AsyncStorage.getItem('doctor_id');
      if (!doctorId) {
        Alert.alert('Error', 'No se encontró el ID del doctor. Por favor inicie sesión nuevamente.');
        return;
      }

      const paciente = {
        nombre,
        edad,
        fechaNacimiento,
        lugarNacimiento,
        estadoCivil,
        cuidador,
        escolaridad,
        ocupacion,
        enfermedades,
        antecedentes: {
          tabaquismo,
          alcoholismo,
          biomasa,
          combe,
          vacunas,
          cirugias,
          transfusiones,
          fracturas,
          alergias,
        },
        doctorId: Number.parseInt(doctorId, 10),
      };

      const insertId = await guardarPaciente(paciente);

      const internetDisponible = await hayInternet();
      if (internetDisponible) {
        const pacienteConId = { id: insertId, ...paciente };
        await guardarPacienteFirebase(pacienteConId);
        await marcarPacienteComoSincronizado(insertId);
      }

      Alert.alert('Éxito', 'Paciente registrado con éxito');
      navigation.navigate('PantallaPrincipal', { nuevoPaciente: { id: insertId, ...paciente } });
      navigation.navigate('Inicio', { nuevoPaciente: { id: insertId, ...paciente } });


      // Limpiar el formulario
      setNombre('');
      setEdad('');
      setEnfermedades('');
      setFechaNacimiento('');
      setLugarNacimiento('');
      setEstadoCivil('');
      setCuidador('');
      setEscolaridad('');
      setOcupacion('');
      setTabaquismo(false);
      setAlcoholismo(false);
      setBiomasa(false);
      setCombe(false);
      setVacunas(false);
      setCirugias(false);
      setTransfusiones(false);
      setFracturas(false);
      setAlergias(false);
    } catch (error: any) {
      console.log('Error al guardar paciente:', error?.message || error);
      Alert.alert('Error', 'No se pudo registrar el paciente. Intente nuevamente.');
    }
  };

  const handleCancelar = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registro de Paciente</Text>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Información Personal</Text>
          </View>

          <Text style={styles.label}>
            Nombre Completo <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ingrese el nombre completo"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <Text style={styles.label}>
            Edad <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="calendar-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={edad}
              onChangeText={setEdad}
              placeholder="Ingrese la edad"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <Text style={styles.label}>Fecha de Nacimiento</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="calendar-number-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={fechaNacimiento}
              onChangeText={setFechaNacimiento}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <Text style={styles.label}>Lugar de Nacimiento</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={lugarNacimiento}
              onChangeText={setLugarNacimiento}
              placeholder="Ciudad, Estado, País"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Información Social</Text>
          </View>

          <Text style={styles.label}>Estado Civil</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="heart-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={estadoCivil}
              onChangeText={setEstadoCivil}
              placeholder="Soltero, Casado, Viudo, etc."
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <Text style={styles.label}>Cuidador</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="medkit-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={cuidador}
              onChangeText={setCuidador}
              placeholder="Nombre del cuidador principal"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <Text style={styles.label}>Escolaridad</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="school-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={escolaridad}
              onChangeText={setEscolaridad}
              placeholder="Nivel de estudios"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <Text style={styles.label}>Ocupación</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="briefcase-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={ocupacion}
              onChangeText={setOcupacion}
              placeholder="Profesión o actividad laboral"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="fitness" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Información Médica</Text>
          </View>

          <Text style={styles.label}>Enfermedades</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <Ionicons name="medical-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={enfermedades}
              onChangeText={setEnfermedades}
              placeholder="Enfermedades diagnosticadas, medicamentos, etc."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.label}>Antecedentes Personales No Patológicos</Text>
          <View style={styles.checkboxContainer}>
            {[
              ['Tabaquismo', tabaquismo, setTabaquismo, 'flame-outline'],
              ['Alcoholismo', alcoholismo, setAlcoholismo, 'wine-outline'],
              ['Exposición a Biomasa', biomasa, setBiomasa, 'leaf-outline'],
              ['Combe', combe, setCombe, 'people-outline'],
              ['Vacunas', vacunas, setVacunas, 'shield-checkmark-outline'],
              ['Cirugías', cirugias, setCirugias, 'cut-outline'],
              ['Transfusiones', transfusiones, setTransfusiones, 'water-outline'],
              ['Fracturas', fracturas, setFracturas, 'bandage-outline'],
              ['Alergias', alergias, setAlergias, 'alert-circle-outline'],
            ].map(([label, value, setter, icon]: any, index) => (
              <View style={styles.checkboxItem} key={index}>
                <View style={styles.checkboxLabelContainer}>
                  <Ionicons name={icon} size={20} color="#4D96FF" style={styles.checkboxIcon} />
                  <Text style={styles.checkboxLabel}>{label}</Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={setter}
                  trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
                  thumbColor={value ? '#4D96FF' : '#9CA3AF'}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.registerButton} onPress={handleRegistrarPaciente} activeOpacity={0.8}>
            <Ionicons name="save-outline" size={22} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.registerButtonText}>Registrar Paciente</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelar} activeOpacity={0.8}>
            <Ionicons name="close-circle-outline" size={22} color="#4B5563" style={styles.buttonIcon} />
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.requiredNote}>
          <Text style={styles.requiredAsterisk}>*</Text> Campos obligatorios
        </Text>
      </ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2463',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#374151',
    fontWeight: '500',
  },
  requiredAsterisk: {
    color: '#E63946',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginLeft: 10,
    marginRight: 5,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    marginTop: 8,
  },
  checkboxItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  checkboxLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxIcon: {
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  registerButton: {
    backgroundColor: '#4D96FF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontSize: 18,
    fontWeight: '500',
  },
  requiredNote: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default PantallaAgregarPaciente;
