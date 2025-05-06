import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  Pressable,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Usa este si da error con 'react-native'
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';

const PantallaPruebaMUST = ({ navigation, route }: any) => {
  const { pacienteId } = route.params || {};
  const [imc, setImc] = useState(0);
  const [pesoPerdido, setPesoPerdido] = useState(0);
  const [enfermedadAguda, setEnfermedadAguda] = useState<boolean | null>(null);
  const [puntajeTotal, setPuntajeTotal] = useState<null | number>(null);
  const [clasificacion, setClasificacion] = useState('');

  const calcularResultado = async() => {
    try{


    if (enfermedadAguda === null) {
      Alert.alert('Por favor, responde si hay enfermedad aguda.');
      return;
    }
    const total = imc + pesoPerdido + (enfermedadAguda === true ? 2 : 0);

    let clasif = '';
    if (total === 0) {clasif = 'Riesgo bajo';}
    else if (total === 1) {clasif = 'Riesgo intermedio';}
    else if (total >= 2) {clasif = 'Riesgo alto';}

    setPuntajeTotal(total );
    setClasificacion(clasif);
    await guardarResultado(pacienteId, 'MUST', total);
    await guardarPruebaFirebase(pacienteId, 'MUST', total);
    navigation.navigate('PantallaPruebas', { total: total, pacienteId: pacienteId });
    } catch (error) {
      console.error('Error al guardar el resultado:', error);
      Alert.alert('Error al guardar el resultado');
    }
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://marketplace.canva.com/EAF8IBXnfTc/1/0/900w/canva-turquesa-y-verde-acuarela-suave-sin-texto-fondo-de-pantalla-para-tel%C3%A9fono-iqYs3DblqD0.jpg',
      }}
      style={styles.backgroundImage}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={{
            uri: 'https://imgs.search.brave.com/ww8GJexrj3FuSzidmYJCGcSUJiTms6XMIjvVgLfSM-g/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jb25j/ZXB0by5kZS93cC1j/b250ZW50L3VwbG9h/ZHMvMjAxNS8wMy9u/dXRyaWNpb24tMS1l/MTU1MDcxMzQ0MjI4/OS5qcGc',
          }}
          style={styles.logo}
        />
        <Text style={styles.title}>Evaluación Nutricional MUST</Text>

        <Text style={styles.label}>Paso 1: Puntaje IMC</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={imc} onValueChange={(value) => setImc(value)}>
            <Picker.Item label="IMC > 20 kg/m² - 0 puntos" value={0} />
            <Picker.Item label="IMC 18.5 – 20 kg/m² - 1 punto" value={1} />
            <Picker.Item label="IMC < 18.5 - 2 puntos" value={2} />
          </Picker>
        </View>

        <Text style={styles.label}>Paso 2: Pérdida de peso</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={pesoPerdido}
            onValueChange={(value) => setPesoPerdido(value)}
          >
            <Picker.Item label="< 5% - 0 puntos" value={0} />
            <Picker.Item label="5 - 10% - 1 punto" value={1} />
            <Picker.Item label="> 10% - 2 puntos" value={2} />
          </Picker>
        </View>

        <Text style={styles.label}>
          Paso 3: ¿Hay enfermedad aguda sin ingesta nutricional?
        </Text>
        <View style={styles.options}>
          <Pressable
            style={[
              styles.optionButton,
              enfermedadAguda === true && styles.selected,
            ]}
            onPress={() => setEnfermedadAguda(true)}
          >
            <Text style={styles.optionText}>Sí</Text>
          </Pressable>
          <Pressable
            style={[
              styles.optionButton,
              enfermedadAguda === false && styles.selected,
            ]}
            onPress={() => setEnfermedadAguda(false)}
          >
            <Text style={styles.optionText}>No</Text>
          </Pressable>
        </View>

        <Pressable style={styles.button} onPress={calcularResultado}>
          <Text style={styles.buttonText}>Obtener Resultado</Text>
        </Pressable>

        {puntajeTotal !== null && (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>Puntaje total: {puntajeTotal}</Text>
            <Text style={styles.resultText}>Clasificación: {clasificacion}</Text>
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
};


const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  logo: {
    width: 220,
    height: 130,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    color: 'white',
  },
   input: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'white',
  },
  pickerBox: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 5,
    marginVertical: 10,
  },
  picker: {
    width: '100%',
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#ccc',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: 'green',
  },
  optionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultBox: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginVertical: 20,
    width: '100%',
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default PantallaPruebaMUST;
