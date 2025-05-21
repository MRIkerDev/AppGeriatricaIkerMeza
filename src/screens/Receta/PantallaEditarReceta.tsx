'use client';

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { editarReceta, guardarEdicionRecetaPendiente } from '../../database/database';
import { editarRecetaFirebase } from '../../utils/firebaseService';
import { hayInternet } from '../../utils/checarInternet';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PantallaEditarReceta = ({ route, navigation }: any) => {
  const { receta, cita, paciente } = route.params;

  const [medicamento, setMedicamento] = useState(receta.Medicamento || '');
  const [dosis, setDosis] = useState(receta.Dosis || '');
  const [via, setVia] = useState(receta.ViaAdministracion || '');
  const [duracion, setDuracion] = useState(receta.DuracionTratamiento || '');
  const [instrucciones, setInstrucciones] = useState(receta.InstruccionesAdicionales || '');

  const handleGuardar = async () => {
    if (!medicamento || !dosis) {
      Alert.alert('Campos requeridos', 'Medicamento y Dosis son obligatorios.');
      return;
    }

    // const recetaActualizada = {
    //   id: receta.id,
    //   Medicamento: medicamento,
    //   Dosis: dosis,
    //   ViaAdministracion: via,
    //   DuracionTratamiento: duracion,
    //   InstruccionesAdicionales: instrucciones,
    //   FirmaDigital: receta.FirmaDigital,
    //   FechaEmision: receta.FechaEmision,
    //   CitaID: receta.CitaID,
    //   PacienteID: receta.PacienteID,
    //   DoctorID: receta.DoctorID,
    // };
    const recetaActualizada = {
      id: receta.id,
      Medicamento: medicamento,
      Dosis: dosis,
      ViaAdministracion: via,
      DuracionTratamiento: duracion,
      InstruccionesAdicionales: instrucciones,
    };


    try {
      await editarReceta(recetaActualizada);

      const hayNet = await hayInternet();
      if (hayNet) {
        await editarRecetaFirebase(receta.id, recetaActualizada);
        console.log('Receta actualizada en Firebase');
      } else {
        await guardarEdicionRecetaPendiente(receta.id, recetaActualizada);
        console.log('Receta guardada como edición pendiente');
      }

      Alert.alert('Éxito', 'Receta actualizada con éxito');
      navigation.navigate('PantallaVerCita', {
        cita,
        paciente,
        recetaEditada: recetaActualizada,
      });
    } catch (error) {
      console.error('Error al actualizar la receta:', error);
      Alert.alert('Error', 'Hubo un error al actualizar la receta');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) {return 'No disponible';}
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Editar Receta Médica</Text>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {paciente && (
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
              <Text style={styles.infoLabel}>Fecha:</Text>
              <Text style={styles.infoValue}>{formatDate(receta.FechaEmision)}</Text>
            </View>
          </View>
        )}

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

          <View style={styles.signatureContainer}>
            <Image
              source={{ uri: receta.FirmaDigital || 'https://via.placeholder.com/150' }}
              style={styles.signatureImage}
              resizeMode="contain"
            />
            <Text style={styles.signatureNote}>La firma no puede ser modificada en la edición</Text>
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
  signatureContainer: {
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  signatureImage: {
    width: '100%',
    height: 150,
    marginBottom: 10,
  },
  signatureNote: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
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

export default PantallaEditarReceta;
