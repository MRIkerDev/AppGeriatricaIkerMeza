import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
// Importamos acelerómetro de react-native-sensors
import { accelerometer } from 'react-native-sensors';

const PantallaPruebaFuncionamiento = ({ navigation }: any) => {
  const [tiempo, setTiempo] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [distancia, setDistancia] = useState('');
  const [velocidad, setVelocidad] = useState(0);
  const [observaciones, setObservaciones] = useState('');
  const [aceleracion, setAceleracion] = useState({ x: 0, y: 0, z: 0 });

  const color = '#8A2BE2';
  let acelerometro: any;

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (corriendo) {
      timer = setInterval(() => {
        setTiempo(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [corriendo]);

  // Acelerómetro
  useEffect(() => {
    const startSensor = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BODY_SENSORS,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('Permiso de sensor no concedido');
          return;
        }
      }

      // Se suscribe al acelerómetro
      // eslint-disable-next-line react-hooks/exhaustive-deps
      acelerometro = accelerometer.subscribe(({ x, y, z }) => {
        setAceleracion({ x, y, z });

        // Si la aceleración supera un umbral, empieza el temporizador
        const magnitud = Math.sqrt(x * x + y * y + z * z);
        if (magnitud > 1.2 && !corriendo) {
          setCorriendo(true);
        }
      });
    };

    startSensor();

    return () => acelerometro?.unsubscribe();
  }, [corriendo]);

  const calcularDistancia = () => {
    if (tiempo > 0 && distancia !== '') {
      const resultado = parseFloat(distancia) / tiempo;
      setVelocidad(parseFloat(resultado.toFixed(2)));
    }
  };

  const detenerTempo = () => {
    setCorriendo(false);
    calcularDistancia();
  };

  const resetTempo = () => {
    setCorriendo(false);
    setTiempo(0);
    setVelocidad(0);
  };

  const enviarDeVuelta = () => {
    let obs = observaciones;
    if (velocidad < 0.8) {
      obs = 'Disminución de desempeño como parte de los componentes que definen a la sarcopenia. ' + obs;
    } else if (velocidad < 1) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      obs = 'Se predice riesgo de desenlaces adversos. ' + obs;
    }

    navigation.navigate('PantallaPruebas', { total: velocidad });
  };

  return (
    <View style={estilos.datosPruebas}>
      <Text style={estilos.textoTitulo}>Velocidad de la marcha</Text>

      <View style={estilos.inputMilti}>
        <View style={estilos.temporizador}>
          <Text>Temporizador</Text>
          <View style={estilos.separadorBoton}>
            <Button title="Parar" color="red" onPress={detenerTempo} />
          </View>
          <View style={estilos.separadorBoton}>
            <Button title="Reiniciar" color="green" onPress={resetTempo} />
          </View>
        </View>

        <View>
          <Text style={{ paddingLeft: 10 }}>Distancia en metros:</Text>
          <TextInput
            style={estilos.input}
            onChangeText={setDistancia}
            value={distancia}
            placeholder="ej. 4"
            keyboardType="numeric"
          />
          <Text style={{ paddingLeft: 10 }}>Tiempo: {tiempo} s</Text>
          <Text style={{ paddingLeft: 10 }}>Velocidad: {velocidad} m/s</Text>
          <Text style={{ paddingLeft: 10 }}>
            Aceleración: X: {aceleracion.x?.toFixed(2)} Y: {aceleracion.y?.toFixed(2)} Z: {aceleracion.z?.toFixed(2)}
          </Text>
        </View>
      </View>

      <Text style={{ paddingLeft: 10 }}>Observaciones adicionales:</Text>
      <TextInput
        style={estilos.input}
        onChangeText={setObservaciones}
        value={observaciones}
        placeholder="ej. se tropieza al caminar"
      />

      <Button title="Terminar Prueba" color={color} onPress={enviarDeVuelta} />
    </View>
  );
};

const estilos = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  inputMilti: {
    marginVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  textoTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  temporizador: {
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  separadorBoton: {
    marginVertical: 12,
  },
  datosPruebas: {
    marginHorizontal: 20,
    backgroundColor: '#55CFFF',
    borderRadius: 15,
    padding: 10,
  },
});

export default PantallaPruebaFuncionamiento;
