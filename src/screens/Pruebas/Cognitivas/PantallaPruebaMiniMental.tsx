'use client';

import { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { hayInternet } from '../../../utils/checarInternet';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PantallaPruebaMiniMental = ({ navigation, route }: any) => {
  const { pacienteId } = route.params || {};
  const [alfabetizacion, setAlfabetizacion] = useState('');
  const [escolaridad, setEscolaridad] = useState('');
  const [orientacion, setOrientacion] = useState('');
  const [registroPalabras, setRegistroPalabras] = useState('');
  const [calculo, setCalculo] = useState('');
  const [memoria, setMemoria] = useState('');
  const [lenguajePraxia, setLenguajePraxia] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [puntuacion, setPuntuacion] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleAceptar = async () => {
    if (!puntuacion) {
      Alert.alert('Error', 'Por favor ingrese la puntuación total');
      return;
    }

    try {
      setGuardando(true);
      const puntaje = Number.parseInt(puntuacion);

      const hayNet = await hayInternet();
      if (hayNet) {
        guardarPruebaFirebase(pacienteId, 'MiniMental', puntaje);
      }

      await guardarResultado(pacienteId, 'MiniMental', puntaje);
      Alert.alert('Éxito', `Puntuación guardada: ${puntuacion}`);
      navigation.navigate('PantallaPruebas', { total: puntaje, pacienteId });
    } catch (error) {
      console.error('Error al guardar el resultado:', error);
      Alert.alert('Error', 'No se pudo guardar el resultado. Inténtelo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mini-Mental State Examination</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Información General</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nivel de alfabetización</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="book-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={alfabetizacion}
                onChangeText={setAlfabetizacion}
                placeholder="Sabe leer y escribir"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Escolaridad</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="school-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={escolaridad}
                onChangeText={setEscolaridad}
                placeholder="Mayor a 3 años"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        <View style={styles.evaluationCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="brain" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Evaluación Cognitiva</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>1. Orientación</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="compass-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={orientacion}
                onChangeText={setOrientacion}
                placeholder="¿En qué lugar está o fecha actual?..."
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>2. Registro de palabras</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="text-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={registroPalabras}
                onChangeText={setRegistroPalabras}
                placeholder="¿Repitió las palabras con éxito?..."
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>3. Cálculo</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="calculator-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={calculo}
                onChangeText={setCalculo}
                placeholder="¿Resta 100 - 7?..."
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>4. Memoria</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="albums-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={memoria}
                onChangeText={setMemoria}
                placeholder="¿Recordó las palabras del registro?..."
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>5. Lenguaje y praxia</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="chatbubble-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={lenguajePraxia}
                onChangeText={setLenguajePraxia}
                placeholder="Realizó la prueba con éxito"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        <View style={styles.resultsCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Resultados</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Observaciones</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Ionicons name="create-outline" size={22} color="#4D96FF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={observaciones}
                onChangeText={setObservaciones}
                placeholder="Las restas las realizó lento"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Puntuación Total <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="stats-chart" size={22} color="#4D96FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={puntuacion}
                onChangeText={setPuntuacion}
                placeholder=">24 puntos"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.interpretationContainer}>
            <Text style={styles.interpretationTitle}>Interpretación:</Text>
            <View style={styles.interpretationItem}>
              <Text style={styles.interpretationScore}>27-30 puntos:</Text>
              <Text style={styles.interpretationText}>Normal</Text>
            </View>
            <View style={styles.interpretationItem}>
              <Text style={styles.interpretationScore}>24-26 puntos:</Text>
              <Text style={styles.interpretationText}>Deterioro cognitivo leve</Text>
            </View>
            <View style={styles.interpretationItem}>
              <Text style={styles.interpretationScore}>20-23 puntos:</Text>
              <Text style={styles.interpretationText}>Deterioro cognitivo moderado</Text>
            </View>
            <View style={styles.interpretationItem}>
              <Text style={styles.interpretationScore}>&lt;20 puntos:</Text>
              <Text style={styles.interpretationText}>Deterioro cognitivo grave</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleAceptar} disabled={guardando} activeOpacity={0.8}>
            {guardando ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.saveButtonText}>Guardar Resultados</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('PantallaPruebas', { pacienteId })}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#4B5563" style={styles.buttonIcon} />
            <Text style={styles.backButtonText}>Regresar</Text>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  infoCard: {
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
  evaluationCard: {
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
  resultsCard: {
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
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
  interpretationContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  interpretationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  interpretationItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  interpretationScore: {
    width: 100,
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  interpretationText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  buttonsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4D96FF',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 14,
  },
  backButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  requiredNote: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default PantallaPruebaMiniMental;
