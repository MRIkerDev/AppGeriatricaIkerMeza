'use client';

import { useState } from 'react';
import { hayInternet } from '../../../utils/checarInternet';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function PantallaPruebaMiniCog({ navigation, route }: any) {
  const { pacienteId } = route.params || {};
  const [palabrasRecordadas, setPalabrasRecordadas] = useState('');
  const [puntuacionReloj, setPuntuacionReloj] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async () => {
    try {
      setGuardando(true);
      const palabras = Number.parseInt(palabrasRecordadas) || 0;
      const reloj = Number.parseInt(puntuacionReloj) || 0;
      const total = palabras + reloj;

      const hayNet = await hayInternet();
      if (hayNet) {
        guardarPruebaFirebase(pacienteId, 'MiniCog', total);
      }
      await guardarResultado(pacienteId, 'MiniCog', total);
      Alert.alert('Éxito', 'Resultado guardado correctamente');
      navigation.navigate('PantallaPruebas', { total: total, pacienteId });
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
        <Text style={styles.headerTitle}>Evaluación Mini-Cog</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.instructionsCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Instrucciones</Text>
          </View>
          <Text style={styles.instructionsText}>
            Esta prueba evalúa la memoria y función cognitiva del paciente. Consta de dos partes: recordar palabras y
            dibujar un reloj.
          </Text>
        </View>

        <View style={styles.memoryCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="brain" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Prueba de Memoria</Text>
          </View>

          <View style={styles.wordsContainer}>
            <View style={styles.wordBadge}>
              <Text style={styles.wordText}>SOL</Text>
            </View>
            <View style={styles.wordBadge}>
              <Text style={styles.wordText}>MANO</Text>
            </View>
            <View style={styles.wordBadge}>
              <Text style={styles.wordText}>CASA</Text>
            </View>
          </View>

          <Text style={styles.memoryInstructions}>
            1. Pida al paciente que repita estas tres palabras.
            {'\n'}
            2. Realice la prueba del reloj.
            {'\n'}
            3. Pida al paciente que recuerde las tres palabras.
          </Text>
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Puntuación</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Palabras recordadas (0-3)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="text" size={22} color="#4D96FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ingrese cantidad (0-3)"
                placeholderTextColor="#9CA3AF"
                value={palabrasRecordadas}
                onChangeText={setPalabrasRecordadas}
                keyboardType="numeric"
                maxLength={1}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dibujo del reloj (0-2)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="time" size={22} color="#4D96FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ingrese puntuación (0-2)"
                placeholderTextColor="#9CA3AF"
                value={puntuacionReloj}
                onChangeText={setPuntuacionReloj}
                keyboardType="numeric"
                maxLength={1}
              />
            </View>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Puntuación Total:</Text>
            <View style={styles.totalValueContainer}>
              <Text style={styles.totalValue}>
                {(Number.parseInt(palabrasRecordadas) || 0) + (Number.parseInt(puntuacionReloj) || 0)}
              </Text>
              <Text style={styles.totalMax}>/5</Text>
            </View>
          </View>
        </View>

        <View style={styles.interpretationCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Interpretación</Text>
          </View>

          <View style={styles.interpretationItem}>
            <Text style={styles.interpretationScore}>0-2 puntos:</Text>
            <Text style={styles.interpretationText}>Posible deterioro cognitivo</Text>
          </View>

          <View style={styles.interpretationItem}>
            <Text style={styles.interpretationScore}>3-5 puntos:</Text>
            <Text style={styles.interpretationText}>Baja probabilidad de deterioro cognitivo</Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={guardando} activeOpacity={0.8}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

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
  instructionsCard: {
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
    marginBottom: 12,
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
  instructionsText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  memoryCard: {
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
  wordsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  wordBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4D96FF',
  },
  memoryInstructions: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  scoreCard: {
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#fff',
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
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  totalValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4D96FF',
  },
  totalMax: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 2,
  },
  interpretationCard: {
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
  interpretationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  interpretationScore: {
    width: 100,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  interpretationText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
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
});
