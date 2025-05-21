'use client';

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { accelerometer, gyroscope } from 'react-native-sensors';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { hayInternet } from '../../../utils/checarInternet';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PantallaPruebaFuncionamiento = ({ navigation, route }: any) => {
  const { pacienteId } = route.params;
  const [tiempo, setTiempo] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [mostrarSensores, setMostrarSensores] = useState(false);
  const [distancia, setDistancia] = useState('');
  const [velocidad, setVelocidad] = useState(0);
  const [observaciones, setObservaciones] = useState('');
  const [aceleracion, setAceleracion] = useState({ x: 0, y: 0, z: 0 });
  const [giroscopio, setGiroscopio] = useState({ x: 0, y: 0, z: 0 });
  const [interpretacionSensores, setInterpretacionSensores] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [resultadoVisible, setResultadoVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (corriendo) {
      timer = setInterval(() => setTiempo((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [corriendo]);

  const interpretarSensores = (acc: { x: number; y: number; z: number }, giro: { x: number; y: number; z: number }) => {
    const observaciones = [];

    const aceleracionTotal = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
    if (aceleracionTotal > 15) {
      observaciones.push('Movimiento muy fuerte (posibles pasos bruscos).');
    } else if (aceleracionTotal > 11) {
      observaciones.push('Movimiento intenso (posible inestabilidad).');
    }

    const giroTotal = Math.abs(giro.x) + Math.abs(giro.y) + Math.abs(giro.z);
    if (giroTotal > 10) {
      observaciones.push('Posible pérdida de equilibrio o marcha irregular.');
    }

    if (observaciones.length === 0) {
      observaciones.push('Marcha estable detectada.');
    }

    return observaciones.join('\n');
  };

  const iniciarPrueba = async () => {
    if (!distancia || Number.parseFloat(distancia) <= 0) {
      Alert.alert('Falta distancia', 'Por favor ingresa la distancia a recorrer antes de iniciar la prueba.');
      return;
    }

    setTiempo(0);
    setVelocidad(0);
    setCorriendo(true);
    setMostrarSensores(true);
    setResultadoVisible(false);

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BODY_SENSORS);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permiso de sensor no concedido', 'No se podrán recopilar datos de los sensores.');
          return;
        }
      } catch (err) {
        console.warn(err);
      }
    }

    accelerometer.subscribe(({ x, y, z }) => {
      const nueva = { x, y, z };
      setAceleracion(nueva);
      setInterpretacionSensores(interpretarSensores(nueva, giroscopio));
    });

    gyroscope.subscribe(({ x, y, z }) => {
      const nuevo = { x, y, z };
      setGiroscopio(nuevo);
      setInterpretacionSensores(interpretarSensores(aceleracion, nuevo));
    });
  };

  const detenerPrueba = () => {
    if (!distancia || Number.parseFloat(distancia) <= 0) {
      Alert.alert('Falta distancia', 'Por favor ingresa la distancia recorrida antes de detener la prueba.');
      return;
    }

    if (tiempo === 0) {
      Alert.alert('Tiempo insuficiente', 'La prueba debe durar al menos 1 segundo.');
      return;
    }

    setCorriendo(false);
    accelerometer.subscribe();
    gyroscope.subscribe();

    const v = Number.parseFloat(distancia) / tiempo;
    const redondeado = Number.parseFloat(v.toFixed(2));
    setVelocidad(redondeado);
    setResultadoVisible(true);

    const interpretacion = interpretarSensores(aceleracion, giroscopio);
    setObservaciones((prev) => interpretacion + (prev ? '\n' + prev : ''));
  };

  const resetearPrueba = () => {
    setCorriendo(false);
    setMostrarSensores(false);
    setTiempo(0);
    setVelocidad(0);
    setDistancia('');
    setAceleracion({ x: 0, y: 0, z: 0 });
    setGiroscopio({ x: 0, y: 0, z: 0 });
    setObservaciones('');
    setInterpretacionSensores('');
    setResultadoVisible(false);

    accelerometer.subscribe();
    gyroscope.subscribe();
  };

  const terminarPrueba = async () => {
    try {
      if (!velocidad) {
        Alert.alert('Datos incompletos', 'Por favor complete la prueba antes de guardar.');
        return;
      }

      setGuardando(true);
      const hayNet = await hayInternet();

      if (!pacienteId) {
        Alert.alert('Error', 'No se proporcionó ID de paciente');
        setGuardando(false);
        return;
      }

      let obs = observaciones;
      if (velocidad < 0.8) {
        obs = 'Disminución de desempeño que podría sugerir sarcopenia.\n' + obs;
      } else if (velocidad < 1) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        obs = 'Posible riesgo de desenlaces adversos.\n' + obs;
      }

      await guardarResultado(pacienteId, 'Velocidad de la marcha', velocidad);
      if (hayNet) {
        await guardarPruebaFirebase(pacienteId, 'Velocidad de la marcha', velocidad);
      }

      setGuardando(false);
      Alert.alert('Resultado guardado', `La velocidad de marcha registrada es: ${velocidad} m/s`, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('PantallaPruebas', { total: velocidad, pacienteId }),
        },
      ]);
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error al guardar el resultado');
      setGuardando(false);
    }
  };

  const getInterpretacionVelocidad = () => {
    if (velocidad < 0.6) {return { texto: 'Riesgo alto de fragilidad', color: '#d32f2f', icono: 'alert-circle' };}
    if (velocidad < 0.8) {return { texto: 'Posible sarcopenia', color: '#f57c00', icono: 'warning' };}
    if (velocidad < 1.0) {return { texto: 'Riesgo moderado', color: '#fbc02d', icono: 'alert' };}
    return { texto: 'Velocidad normal', color: '#388e3c', icono: 'checkmark-circle' };
  };

  const interpretacion = getInterpretacionVelocidad();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#0A2463" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Velocidad de la Marcha</Text>
        </View>

        {/* Tarjeta de instrucciones */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Instrucciones</Text>
          </View>
          <Text style={styles.instructionText}>1. Ingrese la distancia que el paciente recorrerá (en metros).</Text>
          <Text style={styles.instructionText}>
            2. Presione "Iniciar Prueba" cuando el paciente comience a caminar.
          </Text>
          <Text style={styles.instructionText}>
            3. Presione "Detener Prueba" cuando el paciente termine el recorrido.
          </Text>
          <Text style={styles.instructionText}>4. Revise los resultados y añada observaciones si es necesario.</Text>
        </View>

        {/* Tarjeta de configuración */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="settings" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Configuración de la Prueba</Text>
          </View>
          <Text style={styles.label}>Distancia a recorrer (metros):</Text>
          <TextInput
            style={styles.input}
            value={distancia}
            onChangeText={setDistancia}
            placeholder="Ej. 4"
            keyboardType="numeric"
            editable={!corriendo}
          />
        </View>

        {/* Tarjeta de control */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="timer" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Control de la Prueba</Text>
          </View>

          {corriendo ? (
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>
                <Ionicons name="time" size={20} color="#0A2463" /> {tiempo} segundos
              </Text>
              <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={detenerPrueba}>
                <Ionicons name="stop-circle" size={20} color="#ffffff" />
                <Text style={styles.buttonText}>Detener Prueba</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.startButton]} onPress={iniciarPrueba}>
                <Ionicons name="play" size={20} color="#ffffff" />
                <Text style={styles.buttonText}>Iniciar Prueba</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetearPrueba}>
                <Ionicons name="refresh" size={20} color="#ffffff" />
                <Text style={styles.buttonText}>Reiniciar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tarjeta de sensores */}
        {mostrarSensores && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics" size={24} color="#0A2463" />
              <Text style={styles.cardTitle}>Datos de Sensores</Text>
            </View>

            <View style={styles.sensorContainer}>
              <Text style={styles.sensorTitle}>
                <Ionicons name="speedometer" size={18} color="#0A2463" /> Acelerómetro
              </Text>
              <View style={styles.sensorData}>
                <Text style={styles.sensorValue}>X: {aceleracion.x.toFixed(2)}</Text>
                <Text style={styles.sensorValue}>Y: {aceleracion.y.toFixed(2)}</Text>
                <Text style={styles.sensorValue}>Z: {aceleracion.z.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.sensorContainer}>
              <Text style={styles.sensorTitle}>
                <Ionicons name="compass" size={18} color="#0A2463" /> Giroscopio
              </Text>
              <View style={styles.sensorData}>
                <Text style={styles.sensorValue}>X: {giroscopio.x.toFixed(2)}</Text>
                <Text style={styles.sensorValue}>Y: {giroscopio.y.toFixed(2)}</Text>
                <Text style={styles.sensorValue}>Z: {giroscopio.z.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.interpretationContainer}>
              <Text style={styles.interpretationTitle}>
                <Ionicons name="analytics" size={18} color="#0A2463" /> Interpretación automática
              </Text>
              <Text style={styles.interpretationText}>{interpretacionSensores}</Text>
            </View>
          </View>
        )}

        {/* Tarjeta de resultados */}
        {resultadoVisible && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#0A2463" />
              <Text style={styles.cardTitle}>Resultados</Text>
            </View>

            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>Velocidad calculada:</Text>
              <View style={styles.velocityContainer}>
                <Text style={styles.velocityValue}>{velocidad.toFixed(2)}</Text>
                <Text style={styles.velocityUnit}>m/s</Text>
              </View>

              <View style={[styles.interpretationBadge, { backgroundColor: interpretacion.color + '20' }]}>
                <Ionicons name={interpretacion.icono} size={20} color={interpretacion.color} />
                <Text style={[styles.interpretationBadgeText, { color: interpretacion.color }]}>
                  {interpretacion.texto}
                </Text>
              </View>
            </View>

            <Text style={styles.label}>Observaciones adicionales:</Text>
            <TextInput
              style={styles.textArea}
              value={observaciones}
              onChangeText={setObservaciones}
              placeholder="Ej. Se observa inestabilidad"
              multiline
            />

            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={terminarPrueba} disabled={guardando}>
              {guardando ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Ionicons name="save" size={20} color="#ffffff" />
                  <Text style={styles.buttonText}>Guardar Resultados</Text>
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
    backgroundColor: '#f0f4f8',
  },
  scrollView: {
    flex: 1,
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
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 12,
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
    fontSize: 15,
    color: '#333333',
    marginBottom: 8,
    lineHeight: 22,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A2463',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 140,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  startButton: {
    backgroundColor: '#4D96FF',
  },
  stopButton: {
    backgroundColor: '#FF6B6B',
  },
  resetButton: {
    backgroundColor: '#FFB347',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    marginTop: 16,
  },
  sensorContainer: {
    marginBottom: 16,
  },
  sensorTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0A2463',
    marginBottom: 8,
  },
  sensorData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  sensorValue: {
    fontSize: 15,
    color: '#333333',
  },
  interpretationContainer: {
    marginTop: 8,
  },
  interpretationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0A2463',
    marginBottom: 8,
  },
  interpretationText: {
    backgroundColor: '#f0f7ff',
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
  },
  resultContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  resultLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  velocityContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  velocityValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0A2463',
  },
  velocityUnit: {
    fontSize: 18,
    color: '#666666',
    marginLeft: 4,
  },
  interpretationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    marginTop: 12,
  },
  interpretationBadgeText: {
    fontWeight: '500',
    marginLeft: 4,
  },
  textArea: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  bottomBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginVertical: 16,
    marginHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  bottomBackButtonText: {
    color: '#666666',
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default PantallaPruebaFuncionamiento;
