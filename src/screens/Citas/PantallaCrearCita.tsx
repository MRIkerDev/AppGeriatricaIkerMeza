
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { agregarCita, cargarPacientes, marcarCitaComoSincronizada } from '../../database/database';
import { hayInternet } from '../../utils/checarInternet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { guardarCitaFirebase } from '../../utils/firebaseService';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PantallaCrearCita = ({ navigation }: any) => {
  const [pacientes, setPacientes] = useState<{ id: number; nombre: string }[]>([]);
  const [pacienteId, setPacienteId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [fechaHoraCita, setFechaHoraCita] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [mostrarTimePicker, setMostrarTimePicker] = useState(false);
  const [motivoCita, setMotivoCita] = useState('');
  const [notasAdicionales, setNotasAdicionales] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamiento, setTratamiento] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      const docId = await AsyncStorage.getItem('doctor_id');
      if (docId) {
        setDoctorId(docId);
        const pacs = await cargarPacientes();
        setPacientes(pacs);
      }
    };

    cargarDatos();
  }, []);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      setFechaSeleccionada(selectedDate);
      setMostrarDatePicker(false);
      setTimeout(() => setMostrarTimePicker(true), 100);
    } else {
      setMostrarDatePicker(false);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (event.type === 'set' && selectedTime) {
      const nuevaFecha = new Date(fechaSeleccionada);
      nuevaFecha.setHours(selectedTime.getHours());
      nuevaFecha.setMinutes(selectedTime.getMinutes());
      setFechaSeleccionada(nuevaFecha);
      setMostrarTimePicker(false);
      setFechaHoraCita(nuevaFecha.toISOString());
    } else {
      setMostrarTimePicker(false);
    }
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('es-ES', options);
  };

  const handleCrearCita = async () => {
    if (!pacienteId || !doctorId || !fechaHoraCita || !motivoCita) {
      Alert.alert('Error', 'Faltan campos obligatorios');
      return;
    }

    const cita = {
      // eslint-disable-next-line radix
      PacienteID: Number.parseInt(pacienteId),
      // eslint-disable-next-line radix
      DoctorID: Number.parseInt(doctorId),
      FechaHoraCita: fechaHoraCita,
      EstadoCita: 'pendiente',
      MotivoCita: motivoCita,
      NotasAdicionales: notasAdicionales,
      Diagnostico: diagnostico,
      Tratamiento: tratamiento,
    };

    try {
      const hayNet = await hayInternet();
      console.log('Cita a guardar:', JSON.stringify(cita, null, 2));

      const insertId = await agregarCita(cita);
      if (hayNet) {
        const citaConId = { id: insertId, ...cita };
        await guardarCitaFirebase(citaConId);
        marcarCitaComoSincronizada(insertId);
      }
      Alert.alert('Éxito', 'Cita registrada correctamente');
      navigation.navigate('PantallaMisCitas', { nuevaCita: { id: insertId, ...cita } });

      // limpiar formulario
      setPacienteId('');
      setFechaHoraCita('');
      setMotivoCita('');
      setNotasAdicionales('');
      setDiagnostico('');
      setTratamiento('');
    } catch (error) {
      console.error('Error al crear cita:', error);
      Alert.alert('Error', 'No se pudo guardar la cita');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nueva Cita</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Información del Paciente</Text>
          </View>

          <Text style={styles.label}>
            Seleccionar Paciente <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={pacienteId}
              onValueChange={setPacienteId}
              style={styles.picker}
              dropdownIconColor="#0A2463"
            >
              <Picker.Item label="Seleccione un paciente" value="" color="#9CA3AF" />
              {pacientes.map((p) => (
                <Picker.Item key={p.id} label={p.nombre} value={p.id.toString()} color="#1F2937" />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Fecha y Hora</Text>
          </View>

          <Text style={styles.label}>
            Fecha y Hora de la Cita <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setMostrarDatePicker(true)} activeOpacity={0.8}>
            <Ionicons name="calendar-outline" size={22} color="#4D96FF" style={styles.dateButtonIcon} />
            <Text style={styles.dateButtonText}>
              {fechaHoraCita ? formatDate(new Date(fechaHoraCita)) : 'Seleccionar Fecha y Hora'}
            </Text>
          </TouchableOpacity>

          {mostrarDatePicker && (
            <DateTimePicker value={fechaSeleccionada} mode="date" display="default" onChange={handleDateChange} />
          )}

          {mostrarTimePicker && (
            <DateTimePicker value={fechaSeleccionada} mode="time" display="default" onChange={handleTimeChange} />
          )}
        </View>

        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Detalles de la Cita</Text>
          </View>

          <Text style={styles.label}>
            Motivo de la Cita <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="help-circle-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
            <TextInput
              value={motivoCita}
              onChangeText={setMotivoCita}
              placeholder="Ej: Consulta de rutina, Control de medicación..."
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>

          <Text style={styles.label}>Notas Adicionales</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <Ionicons name="create-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
            <TextInput
              value={notasAdicionales}
              onChangeText={setNotasAdicionales}
              multiline
              numberOfLines={3}
              placeholder="Información adicional relevante para la cita"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.textArea]}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medkit" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Información Médica</Text>
          </View>

          <Text style={styles.label}>Diagnóstico</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <Ionicons name="fitness-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
            <TextInput
              value={diagnostico}
              onChangeText={setDiagnostico}
              multiline
              numberOfLines={3}
              placeholder="Diagnóstico preliminar (puede completarse después)"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.textArea]}
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.label}>Tratamiento</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <Ionicons name="medical-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
            <TextInput
              value={tratamiento}
              onChangeText={setTratamiento}
              multiline
              numberOfLines={3}
              placeholder="Tratamiento recomendado (puede completarse después)"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.textArea]}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.createButton} onPress={handleCrearCita} activeOpacity={0.8}>
            <Ionicons name="checkmark-circle" size={22} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.createButtonText}>Crear Cita</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dateButtonIcon: {
    marginRight: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1F2937',
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
  buttonContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  createButton: {
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
  createButtonText: {
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

export default PantallaCrearCita;
