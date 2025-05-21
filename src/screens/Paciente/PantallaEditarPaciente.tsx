import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { editarPaciente, guardarEdicionPendiente } from '../../database/database';
import { editarPacienteFirebase } from '../../utils/firebaseService';
import { hayInternet } from '../../utils/checarInternet';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PantallaEditarPaciente = ({ route, navigation }: any) => {
  const { pacienteId, paciente } = route.params;

  const [nombre, setNombre] = useState(paciente.nombre);
  const [edad, setEdad] = useState(paciente.edad ? paciente.edad.toString() : '');
  const [fechaNacimiento, setFechaNacimiento] = useState(paciente.fechaNacimiento || '');
  const [lugarNacimiento, setLugarNacimiento] = useState(paciente.lugarNacimiento || '');
  const [estadoCivil, setEstadoCivil] = useState(paciente.estadoCivil || '');
  const [cuidador, setCuidador] = useState(paciente.cuidador || '');
  const [escolaridad, setEscolaridad] = useState(paciente.escolaridad || '');
  const [ocupacion, setOcupacion] = useState(paciente.ocupacion || '');
  const [enfermedades, setEnfermedades] = useState(paciente.enfermedades || '');

  // Antecedentes
  let antecedentesObj = paciente.antecedentes || {};
  if (typeof antecedentesObj === 'string') {
    try {
      antecedentesObj = JSON.parse(antecedentesObj);
    } catch {
      antecedentesObj = {};
    }
  }

  const [tabaquismo, setTabaquismo] = useState(antecedentesObj.tabaquismo || false);
  const [alcoholismo, setAlcoholismo] = useState(antecedentesObj.alcoholismo || false);
  const [biomasa, setBiomasa] = useState(antecedentesObj.biomasa || false);
  const [combe, setCombe] = useState(antecedentesObj.combe || false);
  const [vacunas, setVacunas] = useState(antecedentesObj.vacunas || false);
  const [cirugias, setCirugias] = useState(antecedentesObj.cirugias || false);
  const [transfusiones, setTransfusiones] = useState(antecedentesObj.transfusiones || false);
  const [fracturas, setFracturas] = useState(antecedentesObj.fracturas || false);
  const [alergias, setAlergias] = useState(antecedentesObj.alergias || false);

  const guardarCambios = async () => {
    if (!nombre || !edad) {
      Alert.alert('Error', 'El nombre y la edad son campos obligatorios');
      return;
    }

    const pacienteActualizado = {
      id: pacienteId,
      nombre,
      edad: Number.parseInt(edad),
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
    };

    try {
      await editarPaciente(pacienteActualizado);
      const estado = await hayInternet();
      if (estado) {
        await editarPacienteFirebase(pacienteId, pacienteActualizado);
        console.log('Paciente actualizado también en Firebase');
      } else {
        await guardarEdicionPendiente(pacienteId, pacienteActualizado);
      }

      Alert.alert('Éxito', 'Paciente actualizado con éxito');
      navigation.navigate('PantallaPrincipal', { pacienteActualizado });
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'Hubo un error al actualizar el paciente');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Editar Paciente</Text>
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
          <TouchableOpacity style={styles.saveButton} onPress={guardarCambios} activeOpacity={0.8}>
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

export default PantallaEditarPaciente;
