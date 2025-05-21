'use client';

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { hayInternet } from '../../../utils/checarInternet';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PantallaPruebaMUST = ({ navigation, route }: any) => {
  const { pacienteId } = route.params || {};
  const [imc, setImc] = useState(0);
  const [pesoPerdido, setPesoPerdido] = useState(0);
  const [enfermedadAguda, setEnfermedadAguda] = useState<boolean | null>(null);
  const [puntajeTotal, setPuntajeTotal] = useState<null | number>(null);
  const [clasificacion, setClasificacion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [todasRespondidas, setTodasRespondidas] = useState(false);

  useEffect(() => {
    // Verificar si todas las preguntas han sido respondidas
    setTodasRespondidas(enfermedadAguda !== null);
  }, [enfermedadAguda]);

  const calcularResultado = () => {
    if (enfermedadAguda === null) {
      Alert.alert('Campos incompletos', 'Por favor, responde si hay enfermedad aguda.');
      return;
    }

    const total = imc + pesoPerdido + (enfermedadAguda === true ? 2 : 0);

    let clasif = '';
    if (total === 0) {
      clasif = 'Riesgo bajo';
    } else if (total === 1) {
      clasif = 'Riesgo intermedio';
    } else if (total >= 2) {
      clasif = 'Riesgo alto';
    }

    setPuntajeTotal(total);
    setClasificacion(clasif);
    setMostrarResultado(true);
  };

  const guardarYNavegar = async () => {
    try {
      setGuardando(true);

      if (puntajeTotal === null) {
        Alert.alert('Error', 'Por favor, calcula el resultado primero.');
        setGuardando(false);
        return;
      }

      await guardarResultado(pacienteId, 'MUST', puntajeTotal);

      const hayNet = await hayInternet();
      if (hayNet) {
        await guardarPruebaFirebase(pacienteId, 'MUST', puntajeTotal);
      }

      setGuardando(false);
      Alert.alert('Éxito', 'Resultado guardado correctamente', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('PantallaPruebas', {
              total: puntajeTotal,
              pacienteId: pacienteId,
            }),
        },
      ]);
    } catch (error) {
      console.error('Error al guardar el resultado:', error);
      Alert.alert('Error', 'No se pudo guardar el resultado. Inténtalo de nuevo.');
      setGuardando(false);
    }
  };

  const getColorPorRiesgo = () => {
    if (puntajeTotal === 0) {return '#4CAF50';} // Verde para riesgo bajo
    if (puntajeTotal === 1) {return '#FFC107';} // Amarillo para riesgo intermedio
    return '#F44336'; // Rojo para riesgo alto
  };

  const getIconoPorRiesgo = () => {
    if (puntajeTotal === 0) {return 'checkmark-circle';}
    if (puntajeTotal === 1) {return 'alert-circle';}
    return 'warning';
  };

  const getRecomendacionPorRiesgo = () => {
    if (puntajeTotal === 0) {
      return 'Repetir cribado: Hospital - semanalmente. Comunidad - mensualmente.';
    }
    if (puntajeTotal === 1) {
      return 'Observar: Hospital - documentar ingesta 3 días. Comunidad - repetir cribado mensualmente.';
    }
    return 'Tratar: Derivar a nutricionista o seguir guías locales. Mejorar y aumentar la ingesta nutricional.';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0A2463" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evaluación MUST</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Tarjeta de instrucciones */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Instrucciones</Text>
          </View>
          <Text style={styles.cardText}>
            La herramienta MUST (Malnutrition Universal Screening Tool) evalúa el riesgo de malnutrición en adultos.
            Complete los tres pasos para obtener una puntuación total.
          </Text>
        </View>

        {/* Paso 1: IMC */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="body" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Paso 1: Puntaje IMC</Text>
          </View>
          <Text style={styles.cardText}>Seleccione el rango de IMC del paciente:</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={imc} onValueChange={(value) => setImc(value)} style={styles.picker} mode="dropdown">
              <Picker.Item label="IMC > 20 kg/m² - 0 puntos" value={0} />
              <Picker.Item label="IMC 18.5 – 20 kg/m² - 1 punto" value={1} />
              <Picker.Item label="IMC < 18.5 - 2 puntos" value={2} />
            </Picker>
          </View>
        </View>

        {/* Paso 2: Pérdida de peso */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-down" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Paso 2: Pérdida de peso</Text>
          </View>
          <Text style={styles.cardText}>Seleccione el porcentaje de pérdida de peso en los últimos 3-6 meses:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={pesoPerdido}
              onValueChange={(value) => setPesoPerdido(value)}
              style={styles.picker}
              mode="dropdown"
            >
              <Picker.Item label="< 5% - 0 puntos" value={0} />
              <Picker.Item label="5 - 10% - 1 punto" value={1} />
              <Picker.Item label="> 10% - 2 puntos" value={2} />
            </Picker>
          </View>
        </View>

        {/* Paso 3: Enfermedad aguda */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="medkit" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Paso 3: Enfermedad aguda</Text>
          </View>
          <Text style={styles.cardText}>
            ¿Hay enfermedad aguda y ha habido o es probable que no haya aporte nutricional por más de 5 días?
          </Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.optionButton, enfermedadAguda === true && styles.optionSelected]}
              onPress={() => setEnfermedadAguda(true)}
            >
              <Ionicons
                name={enfermedadAguda === true ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={enfermedadAguda === true ? '#ffffff' : '#0A2463'}
              />
              <Text style={[styles.optionText, enfermedadAguda === true && styles.optionTextSelected]}>
                Sí (2 puntos)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, enfermedadAguda === false && styles.optionSelected]}
              onPress={() => setEnfermedadAguda(false)}
            >
              <Ionicons
                name={enfermedadAguda === false ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={enfermedadAguda === false ? '#ffffff' : '#0A2463'}
              />
              <Text style={[styles.optionText, enfermedadAguda === false && styles.optionTextSelected]}>
                No (0 puntos)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, !todasRespondidas && styles.actionButtonDisabled]}
            onPress={calcularResultado}
            disabled={!todasRespondidas}
          >
            <Ionicons name="calculator" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Calcular Resultado</Text>
          </TouchableOpacity>
        </View>

        {/* Resultados */}
        {mostrarResultado && puntajeTotal !== null && (
          <View style={[styles.card, { borderColor: getColorPorRiesgo() }]}>
            <View style={[styles.cardHeader, { backgroundColor: getColorPorRiesgo() }]}>
              <Ionicons name={getIconoPorRiesgo()} size={24} color="#ffffff" />
              <Text style={[styles.cardTitle, { color: '#ffffff' }]}>Resultado</Text>
            </View>

            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>Puntaje total:</Text>
              <Text style={[styles.resultValue, { color: getColorPorRiesgo() }]}>{puntajeTotal}</Text>
            </View>

            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>Clasificación:</Text>
              <Text style={[styles.resultValue, { color: getColorPorRiesgo() }]}>{clasificacion}</Text>
            </View>

            <View style={styles.recommendationContainer}>
              <Text style={styles.recommendationTitle}>Recomendación:</Text>
              <Text style={styles.recommendationText}>{getRecomendacionPorRiesgo()}</Text>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: getColorPorRiesgo() }]}
              onPress={guardarYNavegar}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Ionicons name="save" size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Guardar Resultado</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Botón de regresar en la parte inferior */}
        <TouchableOpacity
          style={styles.bottomBackButton}
          onPress={() => navigation.navigate('PantallaPruebas', { pacienteId })}
        >
          <Ionicons name="arrow-back-circle" size={20} color="#666666" />
          <Text style={styles.bottomBackButtonText}>Volver a Pruebas</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0A2463',
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#4D96FF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#333333',
    padding: 16,
    paddingTop: 12,
  },
  pickerContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0A2463',
    flex: 1,
    marginHorizontal: 4,
  },
  optionSelected: {
    backgroundColor: '#0A2463',
    borderColor: '#0A2463',
  },
  optionText: {
    fontSize: 16,
    color: '#0A2463',
    marginLeft: 8,
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  actionButtonsContainer: {
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4D96FF',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  actionButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recommendationContainer: {
    padding: 16,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
  },
  bottomBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  bottomBackButtonText: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 8,
  },
});

export default PantallaPruebaMUST;
