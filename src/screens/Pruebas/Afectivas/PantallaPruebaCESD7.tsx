'use client';

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { hayInternet } from '../../../utils/checarInternet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';

const PantallaPruebaCESD7 = ({ navigation, route }: any) => {
  const { pacienteId } = route.params || {};
  const questions = [
    '1. ¿Se sintió decaído(a)?',
    '2. ¿Tuvo problemas para dormir bien?',
    '3. ¿Se sintió solo(a)?',
    '4. ¿Se sintió triste?',
    '5. ¿Sintió que todo lo que hacía era un esfuerzo?',
    '6. ¿Sintió que no podía seguir con su vida?',
    '7. ¿Estuvo molesto(a) o irritable?',
  ];

  const responseOptions = [
    { label: 'Seleccione una respuesta', value: '', points: 0 },
    { label: 'Rara vez o nunca', value: 'Rara vez o nunca', points: 0 },
    { label: 'Pocas veces', value: 'Pocas veces', points: 1 },
    { label: 'Considerable', value: 'Considerable', points: 2 },
    { label: 'Todo el tiempo', value: 'Todo el tiempo', points: 3 },
  ];

  const [answers, setAnswers] = useState(Array(7).fill(''));
  const [score, setScore] = useState(0);
  const [hasSymptoms, setHasSymptoms] = useState<boolean | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const getPoints = (response: string) => {
    const option = responseOptions.find((opt) => opt.value === response);
    return option ? option.points : 0;
  };

  const calcularPuntuacion = () => {
    return answers.reduce((acc, curr) => acc + getPoints(curr), 0);
  };

  const evaluar = async () => {
    // Verificar que todas las preguntas tengan respuesta
    if (answers.some((answer) => answer === '')) {
      Alert.alert('Error', 'Por favor responda todas las preguntas');
      return;
    }

    try {
      setGuardando(true);
      const total = calcularPuntuacion();
      setScore(total);
      setHasSymptoms(total >= 5);
      setShowResult(true);

      const hayNet = await hayInternet();
      await guardarResultado(pacienteId, 'CESD7', total);
      if (hayNet) {
        guardarPruebaFirebase(pacienteId, 'CESD7', total);
      }

      // Mostrar resultado antes de navegar
      setTimeout(() => {
        navigation.navigate('PantallaPruebas', { total: total, pacienteId: pacienteId });
      }, 1500);
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
        <Text style={styles.headerTitle}>Escala CESD-7</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.instructionsCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Información General</Text>
          </View>
          <Text style={styles.instructionsText}>
            La escala CESD-7 es una herramienta de evaluación para detectar síntomas depresivos. Indique cómo se ha
            sentido el paciente durante la última semana.
          </Text>
        </View>

        <View style={styles.optionsCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="options" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Opciones de Respuesta</Text>
          </View>

          <View style={styles.optionItem}>
            <View style={[styles.optionBadge, styles.optionBadge0]}>
              <Text style={styles.optionBadgeText}>0</Text>
            </View>
            <Text style={styles.optionText}>Rara vez o nunca</Text>
          </View>

          <View style={styles.optionItem}>
            <View style={[styles.optionBadge, styles.optionBadge1]}>
              <Text style={styles.optionBadgeText}>1</Text>
            </View>
            <Text style={styles.optionText}>Pocas veces</Text>
          </View>

          <View style={styles.optionItem}>
            <View style={[styles.optionBadge, styles.optionBadge2]}>
              <Text style={styles.optionBadgeText}>2</Text>
            </View>
            <Text style={styles.optionText}>Considerable</Text>
          </View>

          <View style={styles.optionItem}>
            <View style={[styles.optionBadge, styles.optionBadge3]}>
              <Text style={styles.optionBadgeText}>3</Text>
            </View>
            <Text style={styles.optionText}>Todo el tiempo</Text>
          </View>
        </View>

        <View style={styles.questionsCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Cuestionario</Text>
          </View>

          {questions.map((question, index) => (
            <View key={index} style={styles.questionContainer}>
              <Text style={styles.questionText}>{question}</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={answers[index]}
                  onValueChange={(itemValue) => {
                    const newAnswers = [...answers];
                    newAnswers[index] = itemValue;
                    setAnswers(newAnswers);
                  }}
                  style={styles.picker}
                  dropdownIconColor="#0A2463"
                >
                  {responseOptions.map((option, optIndex) => (
                    <Picker.Item
                      key={optIndex}
                      label={option.label}
                      value={option.value}
                      color={optIndex === 0 ? '#9CA3AF' : '#1F2937'}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          ))}
        </View>

        {showResult && (
          <View style={styles.resultCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={22} color="#0A2463" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Resultado</Text>
            </View>

            <View style={[styles.resultContent, hasSymptoms ? styles.resultWarning : styles.resultSuccess]}>
              <Ionicons
                name={hasSymptoms ? 'warning' : 'checkmark-circle'}
                size={30}
                color={hasSymptoms ? '#F59E0B' : '#10B981'}
                style={styles.resultIcon}
              />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultTitle}>
                  {hasSymptoms ? 'Indicios de síntomas depresivos' : 'Sin síntomas depresivos importantes'}
                </Text>
                <Text style={styles.resultDescription}>
                  {hasSymptoms
                    ? 'Se recomienda una evaluación más detallada.'
                    : 'No se requieren acciones adicionales.'}
                </Text>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>Puntuación total:</Text>
                  <Text style={[styles.scoreValue, hasSymptoms ? styles.scoreWarning : styles.scoreSuccess]}>
                    {score} puntos
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.evaluateButton} onPress={evaluar} disabled={guardando} activeOpacity={0.8}>
            {guardando ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="analytics" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.evaluateButtonText}>Evaluar</Text>
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
  optionsCard: {
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
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionBadge0: {
    backgroundColor: '#E5E7EB',
  },
  optionBadge1: {
    backgroundColor: '#BFDBFE',
  },
  optionBadge2: {
    backgroundColor: '#FEF3C7',
  },
  optionBadge3: {
    backgroundColor: '#FEE2E2',
  },
  optionBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  optionText: {
    fontSize: 14,
    color: '#4B5563',
  },
  questionsCard: {
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
  questionContainer: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  resultCard: {
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
  resultContent: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 16,
  },
  resultSuccess: {
    backgroundColor: '#D1FAE5',
  },
  resultWarning: {
    backgroundColor: '#FEF3C7',
  },
  resultIcon: {
    marginRight: 16,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreSuccess: {
    color: '#10B981',
  },
  scoreWarning: {
    color: '#F59E0B',
  },
  buttonsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  evaluateButton: {
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
  evaluateButtonText: {
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

export default PantallaPruebaCESD7;
