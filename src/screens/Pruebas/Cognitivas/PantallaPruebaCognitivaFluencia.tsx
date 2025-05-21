'use client';

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { hayInternet } from '../../../utils/checarInternet';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CATEGORIAS = ['animales', 'supermercado', 'frutas'] as const;
const FILAS_TOTALES = 15;

type Categoria = (typeof CATEGORIAS)[number]
type EntradaPalabra = { animales: string; supermercado: string; frutas: string }

const PantallaPruebaCognitivaFluencia = ({ navigation, route }: any) => {
  console.log('Params recibidos en PantallaPruebaCognitivaFluencia:', route.params);
  const { pacienteId } = route.params;
  const [Total, setTotal] = useState(0);
  const [Aciertos, setAciertos] = useState(0);
  const [Errores, setErrores] = useState(0);

  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [palabras, setPalabras] = useState<EntradaPalabra[]>(
    Array.from({ length: FILAS_TOTALES }, () => ({ animales: '', supermercado: '', frutas: '' })),
  );
  const [pruebaTerminada, setPruebaTerminada] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (tiempoRestante > 0) {
      const temporizador = setTimeout(() => setTiempoRestante(tiempoRestante - 1), 1000);
      return () => clearTimeout(temporizador);
    } else {
      setPruebaTerminada(true);
    }
  }, [tiempoRestante]);

  const manejarCambioInput = (texto: string, indiceFila: number, categoria: Categoria) => {
    const nuevasPalabras = [...palabras];
    nuevasPalabras[indiceFila] = { ...nuevasPalabras[indiceFila], [categoria]: texto };
    setPalabras(nuevasPalabras);
  };

  const manejarAciertos = (valor: string) => {
    const aciertos = Number.parseInt(valor) || 0;
    setAciertos(aciertos);
    setTotal(aciertos - Errores);
  };

  const manejarErrores = (valor: string) => {
    const errores = Number.parseInt(valor) || 0;
    setErrores(errores);
    setTotal(Aciertos - errores);
  };

  const manejarEnvio = async () => {
    try {
      setGuardando(true);
      const hayNet = await hayInternet();
      const total = Aciertos - Errores;
      await guardarResultado(pacienteId, 'Fluencia Verbal Semántica', total); // SQLite
      if (hayNet) {
        guardarPruebaFirebase(pacienteId, 'Fluencia Verbal Semántica', total);
      }

      Alert.alert('Éxito', 'Resultado guardado correctamente');
      navigation.navigate('PantallaPruebas', { total: total, pacienteId });
    } catch (error) {
      console.error('Error al guardar el resultado:', error);
      Alert.alert('Error', 'No se pudo guardar el resultado. Inténtelo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };


  const getTimerColor = () => {
    if (tiempoRestante > 30) {return '#10B981';}
    if (tiempoRestante > 10) {return '#F59E0B';}
    return '#E63946';
  };

  const getTimerPercentage = () => {
    return (tiempoRestante / 60) * 100;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Prueba de Fluencia Verbal</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Sección de instrucciones */}
          <View style={styles.instructionsCard}>
            <View style={styles.instructionsHeader}>
              <Ionicons name="information-circle" size={22} color="#0A2463" style={styles.instructionIcon} />
              <Text style={styles.instructionsTitle}>Instrucciones</Text>
            </View>
            <Text style={styles.instructionsText}>
              Escriba todas las palabras que pueda pensar en cada categoría. Tiene 60 segundos para completar la prueba.
            </Text>
          </View>

          {/* Temporizador */}
          <View style={styles.timerCard}>
            <View style={styles.timerHeader}>
              <Ionicons name="time" size={22} color={getTimerColor()} style={styles.timerIcon} />
              <Text style={[styles.timerText, { color: getTimerColor() }]}>
                {pruebaTerminada ? 'Tiempo finalizado' : `${tiempoRestante} segundos restantes`}
              </Text>
            </View>
            <View style={styles.timerBarContainer}>
              <View
                style={[styles.timerBar, { width: `${getTimerPercentage()}%`, backgroundColor: getTimerColor() }]}
              />
            </View>
          </View>

          {/* Tabla de palabras */}
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>#</Text>
              {CATEGORIAS.map((categoria) => (
                <Text key={categoria} style={styles.tableHeaderCell}>
                  {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                </Text>
              ))}
            </View>

            {palabras.map((_, indice) => (
              <View key={indice} style={[styles.tableRow, indice % 2 === 0 ? styles.evenRow : styles.oddRow]}>
                <Text style={styles.rowNumber}>{indice + 1}</Text>
                {CATEGORIAS.map((categoria) => (
                  <TextInput
                    key={categoria}
                    style={[styles.input, pruebaTerminada && styles.disabledInput]}
                    editable={!pruebaTerminada}
                    onChangeText={(texto) => manejarCambioInput(texto, indice, categoria)}
                    value={palabras[indice][categoria]}
                    placeholder={pruebaTerminada ? '' : '...'}
                    placeholderTextColor="#9CA3AF"
                  />
                ))}
              </View>
            ))}
          </View>

          {/* Sección de resultados */}
          <View style={styles.resultsCard}>
            <View style={styles.resultsHeader}>
              <Ionicons name="stats-chart" size={22} color="#0A2463" style={styles.resultsIcon} />
              <Text style={styles.resultsTitle}>Resultados</Text>
            </View>

            <View style={styles.resultsRow}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Aciertos:</Text>
                <TextInput
                  style={styles.resultInput}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  onChangeText={manejarAciertos}
                  value={Aciertos > 0 ? Aciertos.toString() : ''}
                />
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Errores:</Text>
                <TextInput
                  style={styles.resultInput}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  onChangeText={manejarErrores}
                  value={Errores > 0 ? Errores.toString() : ''}
                />
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Total:</Text>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalValue}>{Total}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, !pruebaTerminada && styles.disabledButton]}
              onPress={manejarEnvio}
              disabled={!pruebaTerminada || guardando}
              activeOpacity={0.8}
            >
              {guardando ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="save" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Guardar Resultados</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.backButton]}
              onPress={() => navigation.navigate('PantallaPruebas', { pacienteId })}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#4B5563" style={styles.buttonIcon} />
              <Text style={styles.backButtonText}>Regresar</Text>
            </TouchableOpacity>
          </View>

          {/* Mensaje de prueba terminada */}
          {pruebaTerminada && (
            <View style={styles.completedBanner}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" style={styles.completedIcon} />
              <Text style={styles.completedText}>Prueba completada. Ingrese los aciertos y errores.</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
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
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionIcon: {
    marginRight: 8,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2463',
  },
  instructionsText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  timerCard: {
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
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerIcon: {
    marginRight: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  timerBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  timerBar: {
    height: '100%',
    borderRadius: 4,
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0A2463',
    padding: 12,
  },
  tableHeaderCell: {
    flex: 1,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  evenRow: {
    backgroundColor: '#F9FAFB',
  },
  oddRow: {
    backgroundColor: '#fff',
  },
  rowNumber: {
    width: 30,
    textAlign: 'center',
    fontWeight: '500',
    color: '#4B5563',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 8,
    marginHorizontal: 4,
    textAlign: 'center',
    color: '#1F2937',
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
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
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultsIcon: {
    marginRight: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2463',
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultItem: {
    flex: 1,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  resultInput: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    textAlign: 'center',
    fontSize: 18,
    color: '#1F2937',
  },
  totalContainer: {
    width: '80%',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4D96FF',
  },
  buttonsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: '#4D96FF',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  backButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  completedIcon: {
    marginRight: 8,
  },
  completedText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PantallaPruebaCognitivaFluencia;
