import React, { useState } from 'react';
import { StyleSheet, Text,View, TouchableOpacity,Button } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { Alert } from 'react-native';
import { hayInternet } from '../../../utils/checarInternet';

// Fuera de PantallaPruebaMNASF
const RadioButton = ({ selected, onPress, label }: any) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <View style={[styles.radioCircle, selected && styles.radioSelected]} />
    <Text>{label}</Text>
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

<RadioButton selected={answers.apetito === '0'} onPress={() => handleSelect('apetito', '0', 0)} label="Ha comido mucho menos (0)" />;


  const handleSelect = (question: any, value: any, score: any) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
    setPuntaje(prev => ({ ...prev, [question]: score }));
  };

  const calcularPuntuacion = async() => {
    try{

    const total = Object.values(puntaje).reduce((sum, score) => sum + score, 0);
    setTotalScore(total);

    let clasif = '';
    if (total >= 12) {clasif = 'Estado nutricional normal';}
    else if (total >= 8) {clasif = 'Riesgo de malnutrición';}
    else {clasif = 'Malnutrición';}

    setClasificacion(clasif);
    await guardarResultado(pacienteId, 'MNASF', total);
    const hayNet = await hayInternet();
    if (hayNet) {
      guardarPruebaFirebase(pacienteId, 'MNASF', total);
      return;
     }
    // Navegar aquí directamente usando el total calculado
    navigation.navigate('PantallaPruebas', { total:total, pacienteId: pacienteId });
    } catch (error) {
      console.error('Error al guardar el resultado:', error);
      Alert.alert('Error al guardar el resultado');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Mini Evaluación Nutricional - Formato Corto (MNA-SF)</Text>

          <View style={styles.questionContainer}>
            <Text style={styles.question}>1. Ha comido menos por falta de apetito, problemas digestivos, dificultades de masticación o deglución en los últimos 3 meses?</Text>
            <RadioButton selected={answers.apetito === '0'} onPress={() => handleSelect('apetito', '0', 0)} label="Ha comido mucho menos (0)" />
            <RadioButton selected={answers.apetito === '1'} onPress={() => handleSelect('apetito', '1', 1)} label="Ha comido menos (1)" />
            <RadioButton selected={answers.apetito === '2'} onPress={() => handleSelect('apetito', '2', 2)} label="Ha comido igual (2)" />
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.question}>2. Pérdida reciente de peso (últimos 3 meses)</Text>
            <RadioButton selected={answers.perdidaPeso === '0'} onPress={() => handleSelect('perdidaPeso', '0', 0)} label="Más de 3 kg (0)" />
            <RadioButton selected={answers.perdidaPeso === '1'} onPress={() => handleSelect('perdidaPeso', '1', 1)} label="No sabe (1)" />
            <RadioButton selected={answers.perdidaPeso === '2'} onPress={() => handleSelect('perdidaPeso', '2', 2)} label="Pérdida entre 1 a 3 kg (2)" />
            <RadioButton selected={answers.perdidaPeso === '3'} onPress={() => handleSelect('perdidaPeso', '3', 3)} label="No ha perdido peso (3)" />
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.question}>3. Movilidad</Text>
            <RadioButton selected={answers.movilidad === '0'} onPress={() => handleSelect('movilidad', '0', 0)} label="De la cama al sillón (0)" />
            <RadioButton selected={answers.movilidad === '1'} onPress={() => handleSelect('movilidad', '1', 1)} label="Autonomía en el interior (1)" />
            <RadioButton selected={answers.movilidad === '2'} onPress={() => handleSelect('movilidad', '2', 2)} label="Sale del domicilio (2)" />
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.question}>4. Ha tenido una enfermedad aguda o situación de estrés psicológico en los últimos 3 meses?</Text>
            <RadioButton selected={answers.estres === '0'} onPress={() => handleSelect('estres', '0', 0)} label="Sí (0)" />
            <RadioButton selected={answers.estres === '1'} onPress={() => handleSelect('estres', '1', 2)} label="No (2)" />
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.question}>5. Problemas neuropsicológicos</Text>
            <RadioButton selected={answers.neuropsicologicos === '0'} onPress={() => handleSelect('neuropsicologicos', '0', 0)} label="Demencia o depresión grave (0)" />
            <RadioButton selected={answers.neuropsicologicos === '1'} onPress={() => handleSelect('neuropsicologicos', '1', 1)} label="Demencia leve (1)" />
            <RadioButton selected={answers.neuropsicologicos === '2'} onPress={() => handleSelect('neuropsicologicos', '2', 2)} label="Sin problemas psicológicos (2)" />
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.question}>6. Índice de masa corporal (IMC)</Text>
            <RadioButton selected={answers.imc === '0'} onPress={() => handleSelect('imc', '0', 0)} label="IMC <19 (0)" />
            <RadioButton selected={answers.imc === '1'} onPress={() => handleSelect('imc', '1', 1)} label="19 ≤ IMC < 21 (1)" />
            <RadioButton selected={answers.imc === '2'} onPress={() => handleSelect('imc', '2', 2)} label="21 ≤ IMC < 23 (2)" />
            <RadioButton selected={answers.imc === '3'} onPress={() => handleSelect('imc', '3', 3)} label="IMC ≥ 23 (3)" />
          </View>

          <View>

            <Text style={styles.result}>Puntuación total: {puntuacionMNASF}</Text>
            <Text style={styles.result}>Clasificación: {clasificacion}</Text>
            <Button title="Calcular Resultado" onPress={calcularPuntuacion} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D6EAF8',
    padding: 20,
  },scrollContainer: {
    paddingBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 20,
  },
  questionContainer: {
    marginBottom: 15,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#14806E',
    marginRight: 10,
  },
  radioSelected: {
    backgroundColor: '#14806E',
  },
  result: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14806E',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default PantallaPruebaMNASF;
