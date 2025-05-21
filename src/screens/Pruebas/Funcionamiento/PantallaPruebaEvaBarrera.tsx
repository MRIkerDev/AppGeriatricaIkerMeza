'use client';

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { hayInternet } from '../../../utils/checarInternet';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Preguntas del formulario
const preguntas = [
  { pregunta: '¿Tiene dificultades para moverse dentro de su hogar?', tipo: 'si_no' },
  { pregunta: '¿Cuántos escalones tiene en la entrada de su hogar?', tipo: 'numerico' },
  { pregunta: 'Describa los obstáculos que dificultan su movilidad.', tipo: 'texto' },
  { pregunta: '¿Existen escalones o desniveles sin pasamanos en su hogar?', tipo: 'si_no' },
  { pregunta: '¿Cuenta con suficiente iluminación en pasillos y escaleras?', tipo: 'si_no' },
  { pregunta: '¿Tiene acceso a transporte adecuado para su movilidad?', tipo: 'si_no' },
  { pregunta: '¿Posee dispositivos auxiliares como bastón o andadera?', tipo: 'si_no' },
];

// Función para calcular la calificación
const calcularCalificacion = (respuestas: (string | number | null)[]) => {
  let puntos = 0;
  let maximo = 0;

  respuestas.forEach((respuesta, index) => {
    if (preguntas[index].tipo === 'si_no') {
      maximo += 2;
      if (respuesta === 'Sí') {
        puntos += 2;
      } else if (respuesta === 'No') {
        puntos += 1;
      }
    }
  });

  const calificacion = maximo > 0 ? ((puntos / maximo) * 10).toFixed(1) : '0.0';
  return calificacion;
};

const PantallaPruebaEvaBarrera = ({ navigation, route }: any) => {
  const { total: totalAnterior, pacienteId } = route.params || {};
  const [index, setIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<Array<string | number | null>>(Array(preguntas.length).fill(null));
  const [calificacion, setCalificacion] = useState<string | null>(null);
  const [total, setTotal] = useState(totalAnterior || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarResumen, setMostrarResumen] = useState(false);

  const handleRespuesta = (respuesta: string | number) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[index] = respuesta;
    setRespuestas(nuevasRespuestas);
  };

  const calcularProgreso = () => {
    const respondidas = respuestas.filter((r) => r !== null).length;
    return (respondidas / preguntas.length) * 100;
  };

  const validarRespuestas = () => {
    const faltantes = respuestas.findIndex((r) => r === null);
    if (faltantes !== -1) {
      Alert.alert('Respuestas incompletas', `Por favor responda la pregunta ${faltantes + 1} antes de continuar.`, [
        { text: 'Entendido', onPress: () => setIndex(faltantes) },
      ]);
      return false;
    }
    return true;
  };

  const handleFinalizar = async () => {
    if (!validarRespuestas()) {return;}

    setMostrarResumen(true);
    const calif = calcularCalificacion(respuestas);
    setCalificacion(calif);
  };

  const handleGuardar = async () => {
    if (!calificacion) {return;}

    setIsLoading(true);
    try {
      const nuevaTotal = total + Number.parseFloat(calificacion);
      setTotal(nuevaTotal);

      const hayNet = await hayInternet();
      if (hayNet) {
        await guardarPruebaFirebase(pacienteId, 'Evaluacion de Barrera', Number.parseFloat(calificacion));
      }

      if (pacienteId) {
        await guardarResultado(pacienteId, 'Evaluacion de Barrera', Number.parseFloat(calificacion));
        console.log('Resultado guardado exitosamente.');
      } else {
        console.warn('No se proporcionó pacienteId.');
      }

      Alert.alert(
        'Evaluación completada',
        `La evaluación ha sido guardada con éxito. Calificación: ${calificacion}/10`,
        [
          {
            text: 'Continuar',
            onPress: () => navigation.navigate('PantallaPruebas', { total: nuevaTotal, pacienteId }),
          },
        ],
      );
    } catch (error) {
      console.error('Error al guardar el resultado:', error);
      Alert.alert('Error', 'No se pudo guardar el resultado. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRecomendacion = () => {
    if (!calificacion) {return '';}
    const score = Number.parseFloat(calificacion);

    if (score >= 8) {
      return 'El entorno del paciente presenta pocas barreras para su movilidad.';
    } else if (score >= 5) {
      return 'El entorno del paciente presenta algunas barreras que podrían afectar su movilidad. Se recomienda considerar adaptaciones.';
    } else {
      return 'El entorno del paciente presenta barreras significativas que afectan su movilidad. Se recomienda una evaluación detallada y adaptaciones urgentes.';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />

      <View style={styles.header}>

        <Text style={styles.headerTitle}>Evaluación de Barreras</Text>
        <View style={styles.iconPlaceholder} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {!mostrarResumen ? (
          <>
            {/* Tarjeta de instrucciones */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle" size={24} color="#0A2463" />
                <Text style={styles.cardTitle}>Instrucciones</Text>
              </View>
              <Text style={styles.cardText}>
                Esta evaluación analiza las barreras físicas en el entorno del paciente que pueden afectar su movilidad
                y autonomía.
              </Text>
            </View>

            {/* Tarjeta de progreso */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="stats-chart" size={24} color="#0A2463" />
                <Text style={styles.cardTitle}>Progreso</Text>
              </View>
              <Text style={styles.progressText}>
                Pregunta {index + 1} de {preguntas.length}
              </Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${calcularProgreso()}%` }]} />
              </View>
              <Text style={styles.progressPercentage}>{Math.round(calcularProgreso())}% completado</Text>
            </View>

            {/* Tarjeta de pregunta actual */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="help-circle" size={24} color="#0A2463" />
                <Text style={styles.cardTitle}>Pregunta {index + 1}</Text>
              </View>
              <Text style={styles.questionText}>{preguntas[index].pregunta}</Text>

              <View style={styles.respuestasContainer}>
                {preguntas[index].tipo === 'si_no' && (
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity
                      onPress={() => handleRespuesta('Sí')}
                      style={[styles.optionButton, respuestas[index] === 'Sí' && styles.optionButtonActive]}
                    >
                      <Ionicons
                        name={respuestas[index] === 'Sí' ? 'checkmark-circle' : 'checkmark-circle-outline'}
                        size={24}
                        color={respuestas[index] === 'Sí' ? 'white' : '#0A2463'}
                      />
                      <Text style={[styles.optionText, respuestas[index] === 'Sí' && styles.optionTextActive]}>Sí</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleRespuesta('No')}
                      style={[styles.optionButton, respuestas[index] === 'No' && styles.optionButtonActive]}
                    >
                      <Ionicons
                        name={respuestas[index] === 'No' ? 'close-circle' : 'close-circle-outline'}
                        size={24}
                        color={respuestas[index] === 'No' ? 'white' : '#0A2463'}
                      />
                      <Text style={[styles.optionText, respuestas[index] === 'No' && styles.optionTextActive]}>No</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {preguntas[index].tipo === 'numerico' && (
                  <View style={styles.inputContainer}>
                    <Ionicons name="calculator-outline" size={24} color="#0A2463" />
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="Ingrese un número"
                      value={respuestas[index]?.toString() || ''}
                      onChangeText={(text) => handleRespuesta(text)}
                    />
                  </View>
                )}

                {preguntas[index].tipo === 'texto' && (
                  <View style={styles.textareaContainer}>
                    <Ionicons name="create-outline" size={24} color="#0A2463" style={styles.textareaIcon} />
                    <TextInput
                      style={styles.textarea}
                      placeholder="Escriba su respuesta aquí..."
                      multiline
                      numberOfLines={4}
                      value={respuestas[index]?.toString() || ''}
                      onChangeText={(text) => handleRespuesta(text)}
                    />
                  </View>
                )}
              </View>
            </View>

            {/* Botones de navegación */}
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={[styles.navButton, index === 0 && styles.disabledButton]}
                onPress={() => setIndex(index - 1)}
                disabled={index === 0}
              >
                <Ionicons name="arrow-back-circle" size={24} color={index === 0 ? '#A0A0A0' : 'white'} />
                <Text style={styles.navButtonText}>Anterior</Text>
              </TouchableOpacity>

              {index < preguntas.length - 1 ? (
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => {
                    if (respuestas[index] !== null) {
                      setIndex(index + 1);
                    } else {
                      Alert.alert('Respuesta requerida', 'Por favor responda la pregunta actual antes de continuar.');
                    }
                  }}
                >
                  <Text style={styles.navButtonText}>Siguiente</Text>
                  <Ionicons name="arrow-forward-circle" size={24} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.navButton} onPress={handleFinalizar}>
                  <Text style={styles.navButtonText}>Finalizar</Text>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                </TouchableOpacity>
              )}
            </View>
            {/* Botón de volver en la parte inferior */}
            <TouchableOpacity
              style={styles.returnButton}
              onPress={() => navigation.navigate('PantallaPruebas', { pacienteId })}
            >
              <Ionicons name="arrow-back-circle" size={20} color="white" />
              <Text style={styles.returnButtonText}>Volver a Pruebas</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Resumen de la evaluación */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="clipboard" size={24} color="#0A2463" />
                <Text style={styles.cardTitle}>Resumen de la Evaluación</Text>
              </View>

              <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>Calificación:</Text>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreText}>{calificacion}</Text>
                  <Text style={styles.scoreMaxText}>/10</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.recommendationTitle}>Interpretación:</Text>
              <Text style={styles.recommendationText}>{getRecomendacion()}</Text>

              <View style={styles.divider} />

              <Text style={styles.summaryTitle}>Respuestas:</Text>
              {preguntas.map((pregunta, idx) => (
                <View key={idx} style={styles.summaryItem}>
                  <Text style={styles.summaryQuestion}>
                    {idx + 1}. {pregunta.pregunta}
                  </Text>
                  <Text style={styles.summaryAnswer}>{respuestas[idx]?.toString() || 'Sin respuesta'}</Text>
                </View>
              ))}
            </View>

            {/* Botones de acción */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => setMostrarResumen(false)}
              >
                <Ionicons name="create" size={24} color="white" />
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleGuardar}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="save" size={24} color="white" />
                    <Text style={styles.actionButtonText}>Guardar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            {/* Botón de volver en la parte inferior */}
            <TouchableOpacity
              style={styles.returnButton}
              onPress={() => navigation.navigate('PantallaPruebas', { pacienteId })}
            >
              <Ionicons name="arrow-back-circle" size={20} color="white" />
              <Text style={styles.returnButtonText}>Volver a Pruebas</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: '#0A2463',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconPlaceholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2463',
    marginLeft: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  progressText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4D96FF',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#777',
    marginTop: 8,
    textAlign: 'right',
  },
  questionText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
    lineHeight: 24,
  },
  respuestasContainer: {
    marginTop: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#0A2463',
    minWidth: 120,
  },
  optionButtonActive: {
    backgroundColor: '#0A2463',
  },
  optionText: {
    fontSize: 16,
    color: '#0A2463',
    marginLeft: 8,
    fontWeight: '500',
  },
  optionTextActive: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#4D96FF',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#333',
  },
  textareaContainer: {
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4D96FF',
    padding: 8,
  },
  textareaIcon: {
    alignSelf: 'flex-start',
    marginTop: 8,
    marginLeft: 8,
  },
  textarea: {
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    paddingHorizontal: 8,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4D96FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 120,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  resultContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  resultLabel: {
    fontSize: 18,
    color: '#555',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0A2463',
  },
  scoreMaxText: {
    fontSize: 24,
    color: '#777',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryItem: {
    marginBottom: 12,
  },
  summaryQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  summaryAnswer: {
    fontSize: 16,
    color: '#555',
    paddingLeft: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flex: 1,
    marginHorizontal: 8,
  },
  editButton: {
    backgroundColor: '#777',
  },
  saveButton: {
    backgroundColor: '#28A745',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#777',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 24,
    alignSelf: 'center',
  },
  returnButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default PantallaPruebaEvaBarrera;
