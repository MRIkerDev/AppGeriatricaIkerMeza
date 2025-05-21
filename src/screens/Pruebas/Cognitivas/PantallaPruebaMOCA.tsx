'use client';

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { hayInternet } from '../../../utils/checarInternet';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PantallaPruebaMOCA = ({ navigation, route }: any) => {
  const { pacienteId } = route.params || {};
  const [funcionesEjecutivas, setFuncionesEjecutivas] = useState('');
  const [denominacion, setDenominacion] = useState('');
  const [orientacion, setOrientacion] = useState('');
  const [memoria, setMemoria] = useState('');
  const [atencion, setAtencion] = useState('');
  const [lenguaje, setLenguaje] = useState('');
  const [abstraccion, setAbstraccion] = useState('');
  const [recuerdoDiferido, setRecuerdoDiferido] = useState('');
  const [puntajeFinal, setPuntajeFinal] = useState('');
  const [guardando, setGuardando] = useState(false);

  const calcularTotal = () => {
    const valores = [
      Number.parseInt(funcionesEjecutivas) || 0,
      Number.parseInt(denominacion) || 0,
      Number.parseInt(orientacion) || 0,
      Number.parseInt(memoria) || 0,
      Number.parseInt(atencion) || 0,
      Number.parseInt(lenguaje) || 0,
      Number.parseInt(abstraccion) || 0,
      Number.parseInt(recuerdoDiferido) || 0,
    ];
    return valores.reduce((a, b) => a + b, 0);
  };

  const actualizarPuntajeFinal = () => {
    setPuntajeFinal(calcularTotal().toString());
  };

  const handleSubmit = async () => {
    if (!puntajeFinal) {
      Alert.alert('Error', 'Por favor ingrese el puntaje final');
      return;
    }

    try {
      setGuardando(true);
      const puntaje = Number.parseInt(puntajeFinal);

      const hayNet = await hayInternet();
      if (hayNet) {
        guardarPruebaFirebase(pacienteId, 'MOCA', puntaje);
      }

      await guardarResultado(pacienteId, 'MOCA', puntaje);
      Alert.alert('Éxito', `Evaluación guardada con puntaje: ${puntajeFinal}`);
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
        <Text style={styles.headerTitle}>Evaluación Cognitiva de Montreal</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.instructionsCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Información General</Text>
          </View>
          <Text style={styles.instructionsText}>
            El MoCA es una herramienta de evaluación cognitiva diseñada para detectar deterioro cognitivo leve. Evalúa
            diferentes dominios cognitivos como atención, concentración, funciones ejecutivas, memoria, lenguaje,
            capacidades visuoconstructivas, cálculo y orientación.
          </Text>
          <Text style={styles.instructionsText}>
            Ingrese la puntuación obtenida en cada sección. El puntaje máximo es 30 puntos.
          </Text>
        </View>

        <View style={styles.evaluationCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="brain" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Dominios Cognitivos</Text>
          </View>

          <View style={styles.domainItem}>
            <View style={styles.domainHeader}>
              <Ionicons name="git-network-outline" size={20} color="#4D96FF" style={styles.domainIcon} />
              <Text style={styles.domainTitle}>Funciones Ejecutivas</Text>
            </View>
            <Text style={styles.domainDescription}>
              Prueba de habilidades como la planificación y el pensamiento abstracto.
            </Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Puntaje:</Text>
              <TextInput
                style={styles.scoreInput}
                value={funcionesEjecutivas}
                onChangeText={(text) => {
                  setFuncionesEjecutivas(text);
                  setTimeout(actualizarPuntajeFinal, 100);
                }}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={1}
              />
              <Text style={styles.scoreMax}>/5</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.domainItem}>
            <View style={styles.domainHeader}>
              <Ionicons name="pricetag-outline" size={20} color="#4D96FF" style={styles.domainIcon} />
              <Text style={styles.domainTitle}>Denominación</Text>
            </View>
            <Text style={styles.domainDescription}>
              Identificación correcta de imágenes de objetos comunes (ej. "Plátano", "Zapato", "Mesa").
            </Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Puntaje:</Text>
              <TextInput
                style={styles.scoreInput}
                value={denominacion}
                onChangeText={(text) => {
                  setDenominacion(text);
                  setTimeout(actualizarPuntajeFinal, 100);
                }}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={1}
              />
              <Text style={styles.scoreMax}>/3</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.domainItem}>
            <View style={styles.domainHeader}>
              <Ionicons name="compass-outline" size={20} color="#4D96FF" style={styles.domainIcon} />
              <Text style={styles.domainTitle}>Orientación</Text>
            </View>
            <Text style={styles.domainDescription}>
              Evaluar si el paciente puede identificar la fecha, el día de la semana, el lugar y la ciudad.
            </Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Puntaje:</Text>
              <TextInput
                style={styles.scoreInput}
                value={orientacion}
                onChangeText={(text) => {
                  setOrientacion(text);
                  setTimeout(actualizarPuntajeFinal, 100);
                }}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={1}
              />
              <Text style={styles.scoreMax}>/6</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.domainItem}>
            <View style={styles.domainHeader}>
              <Ionicons name="albums-outline" size={20} color="#4D96FF" style={styles.domainIcon} />
              <Text style={styles.domainTitle}>Memoria</Text>
            </View>
            <Text style={styles.domainDescription}>
              Se presentan palabras al paciente y se le pide que las recuerde más tarde.
            </Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Puntaje:</Text>
              <TextInput
                style={styles.scoreInput}
                value={memoria}
                onChangeText={(text) => {
                  setMemoria(text);
                  setTimeout(actualizarPuntajeFinal, 100);
                }}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={1}
              />
              <Text style={styles.scoreMax}>/5</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.domainItem}>
            <View style={styles.domainHeader}>
              <Ionicons name="eye-outline" size={20} color="#4D96FF" style={styles.domainIcon} />
              <Text style={styles.domainTitle}>Atención</Text>
            </View>
            <Text style={styles.domainDescription}>
              Se evalúa la capacidad de concentración mediante tareas como repetir números o restar de 7 en 7.
            </Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Puntaje:</Text>
              <TextInput
                style={styles.scoreInput}
                value={atencion}
                onChangeText={(text) => {
                  setAtencion(text);
                  setTimeout(actualizarPuntajeFinal, 100);
                }}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={1}
              />
              <Text style={styles.scoreMax}>/6</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.domainItem}>
            <View style={styles.domainHeader}>
              <Ionicons name="chatbubble-outline" size={20} color="#4D96FF" style={styles.domainIcon} />
              <Text style={styles.domainTitle}>Lenguaje</Text>
            </View>
            <Text style={styles.domainDescription}>
              Evaluación de la fluidez verbal y la capacidad de repetir frases complejas.
            </Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Puntaje:</Text>
              <TextInput
                style={styles.scoreInput}
                value={lenguaje}
                onChangeText={(text) => {
                  setLenguaje(text);
                  setTimeout(actualizarPuntajeFinal, 100);
                }}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={1}
              />
              <Text style={styles.scoreMax}>/3</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.domainItem}>
            <View style={styles.domainHeader}>
              <Ionicons name="bulb-outline" size={20} color="#4D96FF" style={styles.domainIcon} />
              <Text style={styles.domainTitle}>Abstracción</Text>
            </View>
            <Text style={styles.domainDescription}>
              Se le pide al paciente que encuentre similitudes entre dos palabras (ej. naranja y plátano).
            </Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Puntaje:</Text>
              <TextInput
                style={styles.scoreInput}
                value={abstraccion}
                onChangeText={(text) => {
                  setAbstraccion(text);
                  setTimeout(actualizarPuntajeFinal, 100);
                }}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={1}
              />
              <Text style={styles.scoreMax}>/2</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.domainItem}>
            <View style={styles.domainHeader}>
              <Ionicons name="time-outline" size={20} color="#4D96FF" style={styles.domainIcon} />
              <Text style={styles.domainTitle}>Recuerdo Diferido</Text>
            </View>
            <Text style={styles.domainDescription}>
              Evaluar si el paciente recuerda palabras presentadas previamente.
            </Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Puntaje:</Text>
              <TextInput
                style={styles.scoreInput}
                value={recuerdoDiferido}
                onChangeText={(text) => {
                  setRecuerdoDiferido(text);
                  setTimeout(actualizarPuntajeFinal, 100);
                }}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={1}
              />
              <Text style={styles.scoreMax}>/5</Text>
            </View>
          </View>
        </View>

        <View style={styles.resultsCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Resultados</Text>
          </View>

          <View style={styles.totalScoreContainer}>
            <Text style={styles.totalScoreLabel}>Puntaje Total:</Text>
            <View style={styles.totalScoreInputContainer}>
              <TextInput
                style={styles.totalScoreInput}
                value={puntajeFinal}
                onChangeText={setPuntajeFinal}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.totalScoreMax}>/30</Text>
            </View>
            <TouchableOpacity style={styles.calculateButton} onPress={actualizarPuntajeFinal} activeOpacity={0.8}>
              <Ionicons name="calculator-outline" size={18} color="#fff" />
              <Text style={styles.calculateButtonText}>Calcular</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.interpretationContainer}>
            <Text style={styles.interpretationTitle}>Interpretación:</Text>
            <View style={styles.interpretationItem}>
              <Text style={styles.interpretationScore}>26-30 puntos:</Text>
              <Text style={styles.interpretationText}>Normal</Text>
            </View>
            <View style={styles.interpretationItem}>
              <Text style={styles.interpretationScore}>18-25 puntos:</Text>
              <Text style={styles.interpretationText}>Deterioro cognitivo leve</Text>
            </View>
            <View style={styles.interpretationItem}>
              <Text style={styles.interpretationScore}>10-17 puntos:</Text>
              <Text style={styles.interpretationText}>Deterioro cognitivo moderado</Text>
            </View>
            <View style={styles.interpretationItem}>
              <Text style={styles.interpretationScore}>&lt;10 puntos:</Text>
              <Text style={styles.interpretationText}>Deterioro cognitivo severo</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={guardando} activeOpacity={0.8}>
            {guardando ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.saveButtonText}>Guardar Evaluación</Text>
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
    marginBottom: 8,
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
  domainItem: {
    marginBottom: 12,
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  domainIcon: {
    marginRight: 6,
  },
  domainTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  domainDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginRight: 8,
  },
  scoreInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 50,
    textAlign: 'center',
    fontSize: 16,
    color: '#1F2937',
  },
  scoreMax: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
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
  totalScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  totalScoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalScoreInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalScoreInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 60,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4D96FF',
  },
  totalScoreMax: {
    fontSize: 16,
    color: '#4D96FF',
    marginLeft: 4,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4D96FF',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  interpretationContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
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
});

export default PantallaPruebaMOCA;
