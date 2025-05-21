'use client';

import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { hayInternet } from '../../../utils/checarInternet';
import Ionicons from 'react-native-vector-icons/Ionicons';

type NavigationProps = {
  navigation: any
  route: any
}

const PantallaPruebaVisual = ({ navigation, route }: NavigationProps) => {
  const { pacienteId } = route.params;
  const [odRosenbaum, setOdRosenbaum] = useState('');
  const [oiRosenbaum, setOiRosenbaum] = useState('');
  const [odSnellen, setOdSnellen] = useState('');
  const [oiSnellen, setOiSnellen] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultadoVisible, setResultadoVisible] = useState(false);
  const [resultadoMensaje, setResultadoMensaje] = useState('');
  const [resultadoTotal, setResultadoTotal] = useState(0);

  const validarCampos = () => {
    if (!odRosenbaum || !oiRosenbaum || !odSnellen || !oiSnellen) {
      Alert.alert('Campos incompletos', 'Por favor complete todos los campos de la evaluación.');
      return false;
    }

    const rosOD = Number.parseFloat(odRosenbaum);
    const rosOI = Number.parseFloat(oiRosenbaum);
    const snelOD = Number.parseFloat(odSnellen);
    const snelOI = Number.parseFloat(oiSnellen);

    if (isNaN(rosOD) || isNaN(rosOI) || isNaN(snelOD) || isNaN(snelOI)) {
      Alert.alert('Valores inválidos', 'Por favor ingrese solo valores numéricos.');
      return false;
    }

    return true;
  };

  const calcularResultado = async () => {
    if (!validarCampos()) {return;}

    setLoading(true);
    try {
      const resultadoRosenbaumOd = Number.parseFloat(odRosenbaum);
      const resultadoRosenbaumOi = Number.parseFloat(oiRosenbaum);
      const resultadoSnellenOd = Number.parseFloat(odSnellen);
      const resultadoSnellenOi = Number.parseFloat(oiSnellen);

      let mensaje = '';
      let total = 0;

      // Rosenbaum
      if (resultadoRosenbaumOd <= 20 && resultadoRosenbaumOi <= 20) {
        mensaje += '✅ Ambos ojos tienen visión normal en Rosenbaum.\n\n';
      } else {
        mensaje += '⚠️ Puede haber un déficit visual con Rosenbaum.\n\n';
        total += 1;
      }

      // Snellen
      if (resultadoSnellenOd === 6 && resultadoSnellenOi === 6) {
        mensaje += '✅ Ambos ojos tienen visión normal en Snellen.';
      } else {
        mensaje += '⚠️ Puede haber un déficit visual con Snellen.';
        total += 1;
      }

      setResultadoMensaje(mensaje);
      setResultadoTotal(total);
      setResultadoVisible(true);
    } catch (error) {
      console.error('Error al calcular el resultado:', error);
      Alert.alert('Error', 'Ocurrió un error al calcular el resultado.');
    } finally {
      setLoading(false);
    }
  };

  const guardarYNavegar = async () => {
    setLoading(true);
    try {
      await guardarResultado(pacienteId, 'Vision', resultadoTotal);
      const hayNet = await hayInternet();
      if (hayNet) {
        await guardarPruebaFirebase(pacienteId, 'Vision', resultadoTotal);
      }

      Alert.alert('Éxito', 'Resultados guardados correctamente', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('PantallaPruebas', {
              total: resultadoTotal,
              pacienteId: pacienteId,
            }),
        },
      ]);
    } catch (error) {
      console.error('Error al guardar el resultado:', error);
      Alert.alert('Error', 'Ocurrió un error al guardar el resultado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0A2463" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Valoración Visual</Text>
      </View>

      <ScrollView style={styles.container}>
        {/* Tarjeta de instrucciones */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Instrucciones</Text>
          </View>
          <Text style={styles.instructionText}>
            Esta prueba evalúa la agudeza visual del paciente utilizando las cartillas de Rosenbaum y Snellen.
          </Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              <Text style={styles.bold}>OD:</Text> Ojo Derecho | <Text style={styles.bold}>OI:</Text> Ojo Izquierdo
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Valores normales:</Text>
            </Text>
            <Text style={styles.infoText}>• Rosenbaum: 20 o menos</Text>
            <Text style={styles.infoText}>• Snellen: 6/6 (ingrese solo el primer número: 6)</Text>
          </View>
        </View>

        {/* Tarjeta de Rosenbaum */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="eye-outline" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Cartilla de Rosenbaum</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Agudeza visual OD (Ojo Derecho):</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Ej: 20"
                value={odRosenbaum}
                onChangeText={setOdRosenbaum}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Agudeza visual OI (Ojo Izquierdo):</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Ej: 20"
                value={oiRosenbaum}
                onChangeText={setOiRosenbaum}
              />
            </View>
          </View>
        </View>

        {/* Tarjeta de Snellen */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="eye" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Cartilla de Snellen</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Agudeza visual OD (Ojo Derecho):</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Ej: 6"
                value={odSnellen}
                onChangeText={setOdSnellen}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Agudeza visual OI (Ojo Izquierdo):</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Ej: 6"
                value={oiSnellen}
                onChangeText={setOiSnellen}
              />
            </View>
          </View>
        </View>

        {/* Resultados */}
        {resultadoVisible && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics" size={24} color="#0A2463" />
              <Text style={styles.cardTitle}>Resultados</Text>
            </View>

            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>{resultadoMensaje}</Text>

              <View
                style={[
                  styles.resultSummary,
                  resultadoTotal === 0
                    ? styles.resultNormal
                    : resultadoTotal === 1
                      ? styles.resultWarning
                      : styles.resultDanger,
                ]}
              >
                <Ionicons
                  name={resultadoTotal === 0 ? 'checkmark-circle' : 'warning'}
                  size={24}
                  color={resultadoTotal === 0 ? '#2e7d32' : resultadoTotal === 1 ? '#ed6c02' : '#d32f2f'}
                />
                <Text style={styles.resultSummaryText}>
                  {resultadoTotal === 0
                    ? 'Visión normal'
                    : resultadoTotal === 1
                      ? 'Posible déficit visual leve'
                      : 'Posible déficit visual significativo'}
                </Text>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={guardarYNavegar} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="save" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Guardar Resultados</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!resultadoVisible && (
          <TouchableOpacity style={styles.calculateButton} onPress={calcularResultado} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="calculator" size={20} color="#fff" />
                <Text style={styles.buttonText}>Calcular Resultado</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Botón de regresar en la parte inferior */}
        <TouchableOpacity
          style={styles.returnButton}
          onPress={() => navigation.navigate('PantallaPruebas', { pacienteId })}
        >
          <Ionicons name="arrow-back-circle" size={20} color="#fff" />
          <Text style={styles.buttonText}>Volver a Pruebas</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
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
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  instructionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  calculateButton: {
    backgroundColor: '#4D96FF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#4D96FF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  returnButton: {
    backgroundColor: '#718096',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultContainer: {
    marginTop: 8,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  resultSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  resultNormal: {
    backgroundColor: '#e8f5e9',
  },
  resultWarning: {
    backgroundColor: '#fff3e0',
  },
  resultDanger: {
    backgroundColor: '#ffebee',
  },
  resultSummaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default PantallaPruebaVisual;
