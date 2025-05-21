
import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { agregarReceta, marcarRecetaComoSincronizada } from '../../database/database';
import { hayInternet } from '../../utils/checarInternet';
import { guardarRecetaFirebase } from '../../utils/firebaseService';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PantallaCrearReceta = ({ navigation, route }: any) => {
  const { cita, paciente } = route.params;
  const [medicamento, setMedicamento] = useState('');
  const [dosis, setDosis] = useState('');
  const [via, setVia] = useState('');
  const [duracion, setDuracion] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [firma, setFirma] = useState<string | null>(null);
  const [esperandoFirma, setEsperandoFirma] = useState(false);
  const [mostrarFirma, setMostrarFirma] = useState(false);

  const signatureRef = useRef<any>(null);

  const handleOK = async (signature: string) => {
    console.log('Firma recibida:', signature);
    setFirma(signature);
    setMostrarFirma(false);
    if (esperandoFirma) {
      // Ya tenemos la firma, ahora sí guardamos
      setEsperandoFirma(false);
      await guardarRecetaConFirma(signature);
    }
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setFirma(null);
  };

  const guardarRecetaConFirma = async (firmaConfirmada: string) => {
    if (!medicamento || !dosis) {
      Alert.alert('Campos requeridos', 'Medicamento y Dosis son obligatorios.');
      return;
    }

    try {
      const doctorId = await AsyncStorage.getItem('doctor_id');
      if (!doctorId) {
        throw new Error('No se encontró el ID del doctor.');
      }

      const nuevaReceta = {
        CitaID: Number(cita.id),
        PacienteID: Number(paciente.id),
        DoctorID: Number(doctorId),
        Medicamento: medicamento,
        Dosis: dosis,
        ViaAdministracion: via,
        DuracionTratamiento: duracion,
        InstruccionesAdicionales: instrucciones,
        FirmaDigital: firmaConfirmada,
        FechaEmision: new Date().toISOString(),
      };

      const hayNet = await hayInternet();
      const recetaId = await agregarReceta(nuevaReceta);
      if (hayNet) {
        const recetaConId = { id: recetaId, ...nuevaReceta };
        console.log('Receta que se enviará a Firebase:', recetaConId);
        await guardarRecetaFirebase(recetaConId);
        marcarRecetaComoSincronizada(recetaId);
        Alert.alert('Receta guardada', 'Receta registrada con éxito.');
      } else {
        Alert.alert(
          'Sin conexión',
          'La receta se ha guardado localmente y se sincronizará cuando haya conexión a internet.',
        );
      }
      navigation.navigate('PantallaVerCita', { cita, paciente, nuevaReceta: { id: recetaId, ...nuevaReceta } });
    } catch (error) {
      console.error('Error al guardar receta:', error);
      Alert.alert('Error', 'Hubo un problema al guardar la receta.');
    }
  };

  const pedirFirmaYGuardar = () => {
    if (!medicamento || !dosis) {
      Alert.alert('Campos requeridos', 'Medicamento y Dosis son obligatorios.');
      return;
    }
    if (!firma) {
      setEsperandoFirma(true);
      setMostrarFirma(true);
    } else {
      guardarRecetaConFirma(firma);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nueva Receta Médica</Text>
      </View>

      {mostrarFirma ? (
        <View style={styles.signatureFullContainer}>
          <View style={styles.signatureHeader}>
            <Text style={styles.signatureTitle}>Firma del Doctor</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setMostrarFirma(false)} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <View style={styles.signatureCanvasContainer}>
            <SignatureCanvas
              ref={signatureRef}
              onOK={handleOK}
              webStyle={'.m-signature-pad--footer { display: none; margin: 0; }'}
              descriptionText="Firme aquí"
              clearText="Limpiar"
              confirmText="Guardar firma"
            />
          </View>

          <View style={styles.signatureActions}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear} activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={20} color="#4B5563" style={styles.buttonIcon} />
              <Text style={styles.clearButtonText}>Borrar Firma</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveSignatureButton}
              onPress={() => signatureRef.current?.readSignature()}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.saveSignatureButtonText}>Guardar Firma</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <View style={styles.patientInfoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="person" size={22} color="#0A2463" style={styles.cardHeaderIcon} />
              <Text style={styles.cardHeaderTitle}>Información del Paciente</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre:</Text>
              <Text style={styles.infoValue}>{paciente.nombre || 'No registrado'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Edad:</Text>
              <Text style={styles.infoValue}>{paciente.edad || 'No registrado'}</Text>
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medical" size={22} color="#0A2463" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Información del Medicamento</Text>
            </View>

            <Text style={styles.label}>
              Medicamento <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="medkit-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={medicamento}
                onChangeText={setMedicamento}
                placeholder="Ej. Paracetamol"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <Text style={styles.label}>
              Dosis <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="flask-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={dosis}
                onChangeText={setDosis}
                placeholder="Ej. 500mg cada 8h"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <Text style={styles.label}>Vía de administración</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="navigate-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={via}
                onChangeText={setVia}
                placeholder="Ej. Oral"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <Text style={styles.label}>Duración del tratamiento</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={duracion}
                onChangeText={setDuracion}
                placeholder="Ej. 5 días"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <Text style={styles.label}>Instrucciones adicionales</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Ionicons name="document-text-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={instrucciones}
                onChangeText={setInstrucciones}
                placeholder="Ej. Tomar después de los alimentos"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.signatureSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="create" size={22} color="#0A2463" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Firma del Doctor</Text>
            </View>

            {firma ? (
              <View style={styles.signaturePreviewContainer}>
                <Image source={{ uri: firma }} style={styles.signaturePreview} resizeMode="contain" />
                <TouchableOpacity
                  style={styles.changeSignatureButton}
                  onPress={() => setMostrarFirma(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="create-outline" size={18} color="#4D96FF" style={styles.buttonIcon} />
                  <Text style={styles.changeSignatureButtonText}>Cambiar Firma</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addSignatureButton}
                onPress={() => setMostrarFirma(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={22} color="#4D96FF" style={styles.buttonIcon} />
                <Text style={styles.addSignatureButtonText}>Añadir Firma</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={pedirFirmaYGuardar} activeOpacity={0.8}>
              <Ionicons name="save-outline" size={22} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.saveButtonText}>Guardar Receta</Text>
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
      )}
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
  patientInfoCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cardHeaderIcon: {
    marginRight: 8,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2463',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  infoLabel: {
    width: 80,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
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
  signatureSection: {
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
  signaturePreviewContainer: {
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  signaturePreview: {
    width: '100%',
    height: 120,
    marginBottom: 10,
  },
  changeSignatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  changeSignatureButtonText: {
    color: '#4D96FF',
    fontSize: 16,
    fontWeight: '500',
  },
  addSignatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  addSignatureButtonText: {
    color: '#4D96FF',
    fontSize: 16,
    fontWeight: '500',
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
  signatureFullContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  signatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  signatureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0A2463',
  },
  closeButton: {
    padding: 4,
  },
  signatureCanvasContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  signatureActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 8,
  },
  clearButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '500',
  },
  saveSignatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4D96FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginLeft: 8,
  },
  saveSignatureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PantallaCrearReceta;
