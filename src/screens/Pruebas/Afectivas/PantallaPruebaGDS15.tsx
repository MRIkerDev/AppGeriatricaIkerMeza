'use client';

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { hayInternet } from '../../../utils/checarInternet';
import Ionicons from 'react-native-vector-icons/Ionicons';

type RespuestasGDS15 = {
  [key: string]: 'Sí' | 'No'
}

const preguntasGDS15 = [
  { id: '1', texto: '¿Está básicamente satisfecho con su vida?' },
  { id: '2', texto: '¿Ha renunciado a muchas de sus actividades o intereses?' },
  { id: '3', texto: '¿Siente que su vida está vacía?' },
  { id: '4', texto: '¿Se siente a menudo aburrido?' },
  { id: '5', texto: '¿Está de buen humor la mayor parte del tiempo?' },
  { id: '6', texto: '¿Teme que algo malo le va a pasar?' },
  { id: '7', texto: '¿Se siente feliz la mayor parte del tiempo?' },
  { id: '8', texto: '¿Se siente a menudo desamparado?' },
  { id: '9', texto: '¿Prefiere quedarse en casa en vez de salir y hacer cosas nuevas?' },
  { id: '10', texto: '¿Cree que tiene más problemas de memoria que la mayoría?' },
  { id: '11', texto: '¿Piensa que es maravilloso estar vivo en este momento?' },
  { id: '12', texto: '¿Se siente inútil en este momento?' },
  { id: '13', texto: '¿Se siente lleno de energía?' },
  { id: '14', texto: '¿Siente que su situación es desesperada?' },
  { id: '15', texto: '¿Piensa que la mayoría de las personas están mejor que usted?' },
];

const PantallaPruebaGDS15 = ({ navigation, route }: any) => {
  const { pacienteId } = route.params || {};
  const [respuestas, setRespuestas] = useState<RespuestasGDS15>({});
  const [guardando, setGuardando] = useState(false);
  const [resultado, setResultado] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleRespuesta = (id: string, respuesta: 'Sí' | 'No') => {
    setRespuestas((prev) => ({ ...prev, [id]: respuesta }));
  };

  const calcularResultado = () => {
    return preguntasGDS15.reduce((total, pregunta) => {
      const respuesta = respuestas[pregunta.id];
      if (
        (['1', '5', '7', '11', '13'].includes(pregunta.id) && respuesta === 'No') ||
        (!['1', '5', '7', '11', '13'].includes(pregunta.id) && respuesta === 'Sí')
      ) {
        return total + 1;
      }
      return total;
    }, 0);
  };

  const getInterpretacion = (puntaje: number) => {
    if (puntaje >= 0 && puntaje <= 5) {
      return {
        texto: 'Normal',
        color: '#10B981',
        icon: 'checkmark-circle',
        descripcion: 'No hay indicios de depresión.',
      };
    } else if (puntaje >= 6 && puntaje <= 9) {
      return {
        texto: 'Depresión leve',
        color: '#F59E0B',
        icon: 'alert-circle',
        descripcion: 'Se recomienda seguimiento y evaluación adicional.',
      };
    } else {
      return {
        texto: 'Depresión establecida',
        color: '#EF4444',
        icon: 'warning',
        descripcion: 'Se recomienda evaluación clínica completa y posible tratamiento.',
      };
    }
  };

  const handleRegistrar = async () => {
    // Verificar que todas las preguntas tengan respuesta
    if (Object.keys(respuestas).length < preguntasGDS15.length) {
      Alert.alert('Error', 'Por favor responda todas las preguntas');
      return;
    }

    try {
      setGuardando(true);
      const puntaje = calcularResultado();
      setResultado(puntaje);
      setShowResult(true);

      const hayNet = await hayInternet();
      await guardarResultado(pacienteId, 'GDS-15', puntaje);
      if (hayNet) {
        guardarPruebaFirebase(pacienteId, 'GDS-15', puntaje);
      }

      // Mostrar resultado antes de navegar
      setTimeout(() => {
        navigation.navigate('PantallaPruebas', { total: puntaje, pacienteId });
      }, 1500);
    } catch (error) {
      console.error('Error al registrar resultado:', error);
      Alert.alert('Error', 'No se pudo guardar el resultado. Inténtelo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const preguntasRespondidas = Object.keys(respuestas).length;
  const totalPreguntas = preguntasGDS15.length;
  const progresoCompletado = (preguntasRespondidas / totalPreguntas) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Escala de Depresión Geriátrica (GDS-15)</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.instructionsCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Información General</Text>
          </View>
          <Text style={styles.instructionsText}>
            La Escala de Depresión Geriátrica (GDS-15) es un instrumento utilizado para detectar síntomas depresivos en
            adultos mayores. Consta de 15 preguntas con respuestas de Sí/No.
          </Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Ionicons name="analytics" size={20} color="#0A2463" style={styles.progressIcon} />
            <Text style={styles.progressTitle}>Progreso</Text>
            <Text style={styles.progressCounter}>
              {preguntasRespondidas}/{totalPreguntas}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progresoCompletado}%` }]} />
          </View>
        </View>

        <View style={styles.questionsCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Cuestionario</Text>
          </View>

          {preguntasGDS15.map((pregunta) => (
            <View key={pregunta.id} style={styles.questionContainer}>
              <View style={styles.questionHeader}>
                <View style={styles.questionNumberContainer}>
                  <Text style={styles.questionNumber}>{pregunta.id}</Text>
                </View>
                <Text style={styles.questionText}>{pregunta.texto}</Text>
              </View>

              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[styles.optionButton, respuestas[pregunta.id] === 'Sí' && styles.optionButtonSelected]}
                  onPress={() => handleRespuesta(pregunta.id, 'Sí')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, respuestas[pregunta.id] === 'Sí' && styles.optionTextSelected]}>
                    Sí
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, respuestas[pregunta.id] === 'No' && styles.optionButtonSelected]}
                  onPress={() => handleRespuesta(pregunta.id, 'No')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, respuestas[pregunta.id] === 'No' && styles.optionTextSelected]}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {showResult && resultado !== null && (
          <View style={styles.resultCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={22} color="#0A2463" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Resultado</Text>
            </View>

            <View
              style={[
                styles.resultContent,
                {
                  backgroundColor: resultado <= 5 ? '#D1FAE5' : resultado <= 9 ? '#FEF3C7' : '#FEE2E2',
                },
              ]}
            >
              <Ionicons
                name={getInterpretacion(resultado).icon}
                size={30}
                color={getInterpretacion(resultado).color}
                style={styles.resultIcon}
              />
              <View style={styles.resultTextContainer}>
                <Text style={[styles.resultTitle, { color: getInterpretacion(resultado).color }]}>
                  {getInterpretacion(resultado).texto}
                </Text>
                <Text style={styles.resultDescription}>{getInterpretacion(resultado).descripcion}</Text>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>Puntuación total:</Text>
                  <Text style={[styles.scoreValue, { color: getInterpretacion(resultado).color }]}>
                    {resultado} puntos
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegistrar}
            disabled={guardando}
            activeOpacity={0.8}
          >
            {guardando ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.registerButtonText}>Registrar Resultados</Text>
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
  progressCard: {
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
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressIcon: {
    marginRight: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  progressCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4D96FF',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4D96FF',
    borderRadius: 4,
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questionNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4D96FF',
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 36,
  },
  optionButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  optionButtonSelected: {
    backgroundColor: '#4D96FF',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
  },
  optionTextSelected: {
    color: '#fff',
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
  resultIcon: {
    marginRight: 16,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  buttonsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  registerButton: {
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
  registerButtonText: {
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

export default PantallaPruebaGDS15;
