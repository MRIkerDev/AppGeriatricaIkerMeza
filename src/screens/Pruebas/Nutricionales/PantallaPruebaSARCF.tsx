import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { hayInternet } from '../../../utils/checarInternet';

const PantallaPruebaSARCF = ({ navigation, route }: any) => {
  const { pacienteId } = route.params || {};
  const [strength, setStrength] = useState('');
  const [assistance, setAssistance] = useState('');
  const [riseFromChair, setRiseFromChair] = useState('');
  const [climbStairs, setClimbStairs] = useState('');
  const [falls, setFalls] = useState('');
  const [totalScore, setTotalScore] = useState(0);

  const calculateScore = async() => {
try{
    const scores = [strength, assistance, riseFromChair, climbStairs, falls].map((val) => parseInt(val) || 0);
    const sum = scores.reduce((acc, num) => acc + num, 0);
    setTotalScore(sum);

    const result = sum >= 4 ? 'Alta probabilidad de sarcopenia' : 'Baja probabilidad de sarcopenia';
    await guardarResultado(pacienteId, 'SARCF', sum);
    const hayNet = await hayInternet();
    if (hayNet) {
      guardarPruebaFirebase(pacienteId, 'SARCF', sum);
      return;
     }
    Alert.alert('Resultado', `Puntaje total: ${sum}\nInterpretación: ${result}`);
    navigation.navigate('PantallaPruebas', { total: sum, pacienteId: pacienteId });
      } catch(error) {
      console.error('Error al guardar el resultado:', error);
      Alert.alert('Error al guardar el resultado');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <Text style={styles.title}>Cuestionario SARC-F</Text>

          <View style={styles.section}>
            <Text style={styles.subtitle}>1. Fuerza (0-2)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ingrese puntaje"
              value={strength}
              onChangeText={setStrength}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.subtitle}>2. Asistencia al caminar (0-2)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ingrese puntaje"
              value={assistance}
              onChangeText={setAssistance}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.subtitle}>3. Levantarse de una silla (0-2)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ingrese puntaje"
              value={riseFromChair}
              onChangeText={setRiseFromChair}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.subtitle}>4. Subir escaleras (0-2)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ingrese puntaje"
              value={climbStairs}
              onChangeText={setClimbStairs}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.subtitle}>5. Caídas (0-2)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ingrese puntaje"
              value={falls}
              onChangeText={setFalls}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={calculateScore}>
            <Text style={styles.buttonText}>Calcular Puntaje</Text>
          </TouchableOpacity>

          <Text style={styles.resultText}>Puntaje total: {totalScore}</Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#20232a',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#61dafb',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#20232a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
});

export default PantallaPruebaSARCF;
