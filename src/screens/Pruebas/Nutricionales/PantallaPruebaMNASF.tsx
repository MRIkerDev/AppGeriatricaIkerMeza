'use client';

import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { hayInternet } from '../../../utils/checarInternet';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Componente RadioButton mejorado
const RadioButton = ({ selected, onPress, label, icon }: any) => (
  <TouchableOpacity style={[styles.option, selected && styles.optionSelected]} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.radioCircle, selected && styles.radioSelected]}>
      {selected && <Ionicons name="checkmark" size={16} color="#fff" />}
    </View>
    {icon && <Ionicons name={icon} size={20} color={selected ? '#fff' : '#0A2463'} style={styles.optionIcon} />}
    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

const PantallaPruebaMNASF = ({ navigation, route }: any) => {
  const { pacienteId } = route.params;
  const [answers, setAnswers] = useState({
    apetito: '',
    perdidaPeso: '',
    movilidad: '',
    estres: '',
    neuropsicologicos: '',
    imc: '',
  });
  const [clasificacion, setClasificacion] = useState('');
  const [puntaje, setPuntaje] = useState({
    apetito: 0,
    perdidaPeso: 0,
    movilidad: 0,
    estres: 0,
    neuropsicologicos: 0,
    imc: 0,
  });
  const [puntuacionMNASF, setTotalScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

  // Verificar si todas las preguntas han sido respondidas
  useEffect(() => {
    const answered = Object.values(answers).every((answer) => answer !== '');
    setAllQuestionsAnswered(answered);
  }, [answers]);

  const handleSelect = (question: string, value: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
    setPuntaje((prev) => ({ ...prev, [question]: score }));
    setShowResults(false); // Ocultar resultados al cambiar una respuesta
  };

  const calcularPuntuacion = () => {
    if (!allQuestionsAnswered) {
      Alert.alert('Formulario incompleto', 'Por favor responda todas las preguntas antes de calcular el resultado.');
      return;
    }

    const total = Object.values(puntaje).reduce((sum, score) => sum + score, 0);
    setTotalScore(total);

    let clasif = '';
    if (total >= 12) {
      clasif = 'Estado nutricional normal';
    } else if (total >= 8) {
      clasif = 'Riesgo de malnutrición';
    } else {
      clasif = 'Malnutrición';
    }

    setClasificacion(clasif);
    setShowResults(true);
  };

  const guardarYNavegar = async () => {
    if (!showResults) {
      calcularPuntuacion();
      return;
    }

    try {
      setIsLoading(true);
      const hayNet = await hayInternet();

      await guardarResultado(pacienteId, 'MNASF', puntuacionMNASF);

      if (hayNet) {
        await guardarPruebaFirebase(pacienteId, 'MNASF', puntuacionMNASF);
      }

      setIsLoading(false);
      Alert.alert('Resultado guardado', 'El resultado ha sido guardado exitosamente.', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('PantallaPruebas', {
              total: puntuacionMNASF,
              pacienteId: pacienteId,
            }),
        },
      ]);
    } catch (error) {
      setIsLoading(false);
      console.error('Error al guardar el resultado:', error);
      Alert.alert('Error', 'No se pudo guardar el resultado. Intente nuevamente.');
    }
  };

  // Calcular el progreso de respuestas
  const answeredCount = Object.values(answers).filter((answer) => answer !== '').length;
  const progressPercentage = (answeredCount / 6) * 100;

  // Obtener color según clasificación
  const getClassificationColor = () => {
    if (!clasificacion) {return '#0A2463';}
    if (clasificacion === 'Estado nutricional normal') {return '#2E7D32';}
    if (clasificacion === 'Riesgo de malnutrición') {return '#FF9800';}
    return '#D32F2F';
  };

  // Obtener icono según clasificación
  const getClassificationIcon = () => {
    if (!clasificacion) {return 'nutrition';}
    if (clasificacion === 'Estado nutricional normal') {return 'checkmark-circle';}
    if (clasificacion === 'Riesgo de malnutrición') {return 'warning';}
    return 'alert-circle';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MNA-SF</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Tarjeta de instrucciones */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Instrucciones</Text>
          </View>
          <Text style={styles.instructionText}>
            La Mini Evaluación Nutricional - Formato Corto (MNA-SF) es una herramienta de cribado que ayuda a
            identificar a adultos mayores desnutridos o en riesgo de desnutrición.
          </Text>

          {/* Barra de progreso */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Progreso: {answeredCount}/6 preguntas</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
            </View>
          </View>
        </View>

        {/* Pregunta 1 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="restaurant" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Apetito</Text>
          </View>
          <Text style={styles.question}>
            1. ¿Ha comido menos por falta de apetito, problemas digestivos, dificultades de masticación o deglución en
            los últimos 3 meses?
          </Text>
          <View style={styles.optionsContainer}>
            <RadioButton
              selected={answers.apetito === '0'}
              onPress={() => handleSelect('apetito', '0', 0)}
              label="Ha comido mucho menos (0)"
              icon="remove-circle"
            />
            <RadioButton
              selected={answers.apetito === '1'}
              onPress={() => handleSelect('apetito', '1', 1)}
              label="Ha comido menos (1)"
              icon="remove"
            />
            <RadioButton
              selected={answers.apetito === '2'}
              onPress={() => handleSelect('apetito', '2', 2)}
              label="Ha comido igual (2)"
              icon="checkmark"
            />
          </View>
        </View>

        {/* Pregunta 2 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-down" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Pérdida de Peso</Text>
          </View>
          <Text style={styles.question}>2. Pérdida reciente de peso (últimos 3 meses)</Text>
          <View style={styles.optionsContainer}>
            <RadioButton
              selected={answers.perdidaPeso === '0'}
              onPress={() => handleSelect('perdidaPeso', '0', 0)}
              label="Más de 3 kg (0)"
              icon="remove-circle"
            />
            <RadioButton
              selected={answers.perdidaPeso === '1'}
              onPress={() => handleSelect('perdidaPeso', '1', 1)}
              label="No sabe (1)"
              icon="help-circle"
            />
            <RadioButton
              selected={answers.perdidaPeso === '2'}
              onPress={() => handleSelect('perdidaPeso', '2', 2)}
              label="Pérdida entre 1 a 3 kg (2)"
              icon="remove"
            />
            <RadioButton
              selected={answers.perdidaPeso === '3'}
              onPress={() => handleSelect('perdidaPeso', '3', 3)}
              label="No ha perdido peso (3)"
              icon="checkmark-circle"
            />
          </View>
        </View>

        {/* Pregunta 3 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="walk" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Movilidad</Text>
          </View>
          <Text style={styles.question}>3. Movilidad</Text>
          <View style={styles.optionsContainer}>
            <RadioButton
              selected={answers.movilidad === '0'}
              onPress={() => handleSelect('movilidad', '0', 0)}
              label="De la cama al sillón (0)"
              icon="bed"
            />
            <RadioButton
              selected={answers.movilidad === '1'}
              onPress={() => handleSelect('movilidad', '1', 1)}
              label="Autonomía en el interior (1)"
              icon="home"
            />
            <RadioButton
              selected={answers.movilidad === '2'}
              onPress={() => handleSelect('movilidad', '2', 2)}
              label="Sale del domicilio (2)"
              icon="exit"
            />
          </View>
        </View>

        {/* Pregunta 4 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="medkit" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Enfermedad Aguda</Text>
          </View>
          <Text style={styles.question}>
            4. ¿Ha tenido una enfermedad aguda o situación de estrés psicológico en los últimos 3 meses?
          </Text>
          <View style={styles.optionsContainer}>
            <RadioButton
              selected={answers.estres === '0'}
              onPress={() => handleSelect('estres', '0', 0)}
              label="Sí (0)"
              icon="alert-circle"
            />
            <RadioButton
              selected={answers.estres === '1'}
              onPress={() => handleSelect('estres', '1', 2)}
              label="No (2)"
              icon="checkmark-circle"
            />
          </View>
        </View>

        {/* Pregunta 5 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="brain" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Problemas Neuropsicológicos</Text>
          </View>
          <Text style={styles.question}>5. Problemas neuropsicológicos</Text>
          <View style={styles.optionsContainer}>
            <RadioButton
              selected={answers.neuropsicologicos === '0'}
              onPress={() => handleSelect('neuropsicologicos', '0', 0)}
              label="Demencia o depresión grave (0)"
              icon="sad"
            />
            <RadioButton
              selected={answers.neuropsicologicos === '1'}
              onPress={() => handleSelect('neuropsicologicos', '1', 1)}
              label="Demencia leve (1)"
              icon="help-circle"
            />
            <RadioButton
              selected={answers.neuropsicologicos === '2'}
              onPress={() => handleSelect('neuropsicologicos', '2', 2)}
              label="Sin problemas psicológicos (2)"
              icon="happy"
            />
          </View>
        </View>

        {/* Pregunta 6 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="body" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Índice de Masa Corporal</Text>
          </View>
          <Text style={styles.question}>6. Índice de masa corporal (IMC)</Text>
          <View style={styles.optionsContainer}>
            <RadioButton
              selected={answers.imc === '0'}
              onPress={() => handleSelect('imc', '0', 0)}
              label="IMC <19 (0)"
              icon="remove-circle"
            />
            <RadioButton
              selected={answers.imc === '1'}
              onPress={() => handleSelect('imc', '1', 1)}
              label="19 ≤ IMC < 21 (1)"
              icon="remove"
            />
            <RadioButton
              selected={answers.imc === '2'}
              onPress={() => handleSelect('imc', '2', 2)}
              label="21 ≤ IMC < 23 (2)"
              icon="add"
            />
            <RadioButton
              selected={answers.imc === '3'}
              onPress={() => handleSelect('imc', '3', 3)}
              label="IMC ≥ 23 (3)"
              icon="add-circle"
            />
          </View>
        </View>

        {/* Resultados */}
        {showResults && (
          <View style={[styles.card, { borderColor: getClassificationColor() }]}>
            <View style={[styles.cardHeader, { backgroundColor: getClassificationColor() }]}>
              <Ionicons name={getClassificationIcon()} size={24} color="#fff" />
              <Text style={[styles.cardTitle, { color: '#fff' }]}>Resultados</Text>
            </View>

            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>Puntuación total:</Text>
              <Text style={[styles.resultValue, { color: getClassificationColor() }]}>{puntuacionMNASF}/14</Text>
            </View>

            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>Clasificación:</Text>
              <Text style={[styles.resultValue, { color: getClassificationColor() }]}>{clasificacion}</Text>
            </View>

            <View style={styles.resultInfo}>
              <Ionicons name={getClassificationIcon()} size={20} color={getClassificationColor()} />
              <Text style={styles.resultInfoText}>
                {clasificacion === 'Estado nutricional normal' && 'No es necesaria una intervención nutricional.'}
                {clasificacion === 'Riesgo de malnutrición' &&
                  'Se recomienda una evaluación nutricional completa y seguimiento.'}
                {clasificacion === 'Malnutrición' &&
                  'Requiere intervención nutricional inmediata y seguimiento especializado.'}
              </Text>
            </View>
          </View>
        )}

        {/* Botones de acción */}
        <View style={styles.buttonsContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4D96FF" />
              <Text style={styles.loadingText}>Guardando resultado...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.actionButton,
                showResults ? styles.saveButton : styles.calculateButton,
                !allQuestionsAnswered && !showResults && styles.disabledButton,
              ]}
              onPress={guardarYNavegar}
              disabled={!allQuestionsAnswered && !showResults}
            >
              <Ionicons name={showResults ? 'save' : 'calculator'} size={24} color="#fff" />
              <Text style={styles.actionButtonText}>{showResults ? 'Guardar y Continuar' : 'Calcular Resultado'}</Text>
            </TouchableOpacity>
          )}

          {/* Botón de regresar en la parte inferior */}
          <TouchableOpacity
            style={styles.backButtonBottom}
            onPress={() => navigation.navigate('PantallaPruebas', { pacienteId })}
          >
            <Ionicons name="arrow-back-circle" size={24} color="#0A2463" />
            <Text style={styles.backButtonText}>Volver a Pruebas</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#0A2463',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  backButton: {
    padding: 8,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#4D96FF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F0F4FF',
    padding: 8,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2463',
    marginLeft: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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
    borderRadius: 4,
  },
  question: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    lineHeight: 22,
  },
  optionsContainer: {
    marginTop: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
    marginBottom: 8,
  },
  optionSelected: {
    backgroundColor: '#4D96FF',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#0A2463',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    backgroundColor: '#0A2463',
    borderColor: '#0A2463',
  },
  optionIcon: {
    marginRight: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
  },
  resultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  resultInfoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  buttonsContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    marginBottom: 16,
  },
  calculateButton: {
    backgroundColor: '#4D96FF',
  },
  saveButton: {
    backgroundColor: '#2E7D32',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
    opacity: 0.7,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  backButtonBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
  },
  backButtonText: {
    color: '#0A2463',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default PantallaPruebaMNASF;
