
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { editarCita, guardarEdicionCitaPendiente } from '../../database/database';
import { Picker } from '@react-native-picker/picker';
import { editarCitaFirebase } from '../../utils/firebaseService';
import { hayInternet } from '../../utils/checarInternet';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PantallaEditarCita = ({ route, navigation }: any) => {
  const { citaId, cita } = route.params;
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date(cita.FechaHoraCita));
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [mostrarTimePicker, setMostrarTimePicker] = useState(false);
  const [fechaHoraCita, setFechaHoraCita] = useState(cita.FechaHoraCita);
  const [motivo, setMotivo] = useState(cita.MotivoCita || '');
  const [estado, setEstado] = useState(cita.EstadoCita || 'pendiente');
  const [notas, setNotas] = useState(cita.NotasAdicionales || '');
  const [diagnostico, setDiagnostico] = useState(cita.Diagnostico || '');
  const [tratamiento, setTratamiento] = useState(cita.Tratamiento || '');

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleGuardar = async () => {
    if (!motivo) {
      Alert.alert('Error', 'El motivo de la cita es obligatorio');
      return;
    }

    const citaActualizada = {
      id: citaId,
      FechaHoraCita: fechaHoraCita,
      EstadoCita: estado,
      MotivoCita: motivo,
      NotasAdicionales: notas,
      Diagnostico: diagnostico,
      Tratamiento: tratamiento,
    };

    try {
      await editarCita(citaActualizada);
      const hayNet = await hayInternet();
      if (hayNet) {
        await editarCitaFirebase(citaId, citaActualizada);
        console.log('Cita actualizada también en Firebase');
      } else {
        await guardarEdicionCitaPendiente(citaId, citaActualizada);
      }
      Alert.alert('Éxito', 'Cita actualizada con éxito');
      navigation.goBack();
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'Hubo un error al actualizar la cita');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Editar Cita</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Fecha y Hora</Text>
          </View>

          <Text style={styles.label}>Fecha y Hora de la Cita</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity style={styles.dateButton} onPress={() => setMostrarDatePicker(true)} activeOpacity={0.8}>
              <Ionicons name="calendar-outline" size={22} color="#4D96FF" style={styles.buttonIcon} />
              <Text style={styles.dateButtonText}>Cambiar Fecha</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.timeButton} onPress={() => setMostrarTimePicker(true)} activeOpacity={0.8}>
              <Ionicons name="time-outline" size={22} color="#4D96FF" style={styles.buttonIcon} />
              <Text style={styles.timeButtonText}>Cambiar Hora</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.selectedDateContainer}>
            <Ionicons name="calendar-number-outline" size={22} color="#4D96FF" style={styles.selectedDateIcon} />
            <Text style={styles.selectedDateText}>{formatDate(fechaHoraCita)}</Text>
          </View>

          {mostrarDatePicker && (
            <DateTimePicker value={fechaSeleccionada} mode="date" display="default" onChange={handleDateChange} />
          )}

          {mostrarTimePicker && (
            <DateTimePicker value={fechaSeleccionada} mode="time" display="default" onChange={handleTimeChange} />
          )}
        </View>

        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Estado de la Cita</Text>
          </View>

          <Text style={styles.label}>Estado</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={estado}
              onValueChange={(itemValue) => setEstado(itemValue)}
              style={styles.picker}
              dropdownIconColor="#0A2463"
            >
              <Picker.Item label="Pendiente" value="pendiente" color="#F59E0B" />
              <Picker.Item label="Cancelada" value="cancelada" color="#EF4444" />
              <Picker.Item label="Realizada" value="realizada" color="#10B981" />
            </Picker>
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Detalles de la Cita</Text>
          </View>

          <Text style={styles.label}>
            Motivo <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="help-circle-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={motivo}
              onChangeText={setMotivo}
              placeholder="Motivo de la cita"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <Text style={styles.label}>Notas</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <Ionicons name="create-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notas}
              onChangeText={setNotas}
              multiline
              numberOfLines={3}
              placeholder="Notas adicionales"
              placeholderTextColor="#9CA3AF"
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
              style={[styles.input, styles.textArea]}
              value={diagnostico}
              onChangeText={setDiagnostico}
              multiline
              numberOfLines={3}
              placeholder="Diagnóstico del paciente"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.label}>Tratamiento</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <Ionicons name="medical-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={tratamiento}
              onChangeText={setTratamiento}
              multiline
              numberOfLines={3}
              placeholder="Tratamiento recomendado"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleGuardar} activeOpacity={0.8}>
            <Ionicons name="save-outline" size={22} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
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
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  timeButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  selectedDateIcon: {
    marginRight: 8,
  },
  selectedDateText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  picker: {
    height: 50,
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
  saveButton: {
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
  saveButtonText: {
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

export default PantallaEditarCita;
