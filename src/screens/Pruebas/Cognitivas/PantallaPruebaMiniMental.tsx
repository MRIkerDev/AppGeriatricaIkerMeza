import React, { useState } from 'react';
import {
  View, StyleSheet, Text, Button,
  TextInput, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { hayInternet } from '../../../utils/checarInternet';

const PantallaPruebaMiniMental = ({ navigation, route }: any) => {
  const { pacienteId } = route.params || {};
  const [alfabetizacion, setAlfabetizacion] = useState('');
  const [escolaridad, setEscolaridad] = useState('');
  const [orientacion, setOrientacion] = useState('');
  const [registroPalabras, setRegistroPalabras] = useState('');
  const [calculo, setCalculo] = useState('');
  const [memoria, setMemoria] = useState('');
  const [lenguajePraxia, setLenguajePraxia] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [puntuacion, setPuntuacion] = useState('');

  const handleAceptar = async () => {
    try {
   const hayNet = await hayInternet();
   if (hayNet) {
    guardarPruebaFirebase(pacienteId, 'MiniMental', parseInt(puntuacion));
    return;
   }
   await guardarResultado(pacienteId, 'MiniMental', parseInt(puntuacion)); // SQLite
    console.log('Puntuación del Mini-Mental:', puntuacion);

    Alert.alert('Puntuación guardada', `Puntuación: ${puntuacion}`);

    // Si necesitas enviar esto a otra pantalla,
    navigation.navigate('PantallaPruebas', {total: parseInt(puntuacion), pacienteId });
    } catch (error) {
      console.error('Error al guardar el resultado:', error);
      Alert.alert('Error al guardar el resultado');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>Resultados del Mini-mental</Text>

            <Text style={styles.inputLabel}>a) Nivel de alfabetización</Text>
            <TextInput style={styles.input} value={alfabetizacion} onChangeText={setAlfabetizacion} placeholder="Sabe leer y escribir" />

            <Text style={styles.inputLabel}>b) Escolaridad</Text>
            <TextInput style={styles.input} value={escolaridad} onChangeText={setEscolaridad} placeholder="Mayor a 3 años" />

            <Text style={styles.inputLabel}>1-Orientación</Text>
            <TextInput style={styles.input} value={orientacion} onChangeText={setOrientacion} placeholder="¿En qué lugar está o fecha actual?..." />

            <Text style={styles.inputLabel}>2-Registro de palabras</Text>
            <TextInput style={styles.input} value={registroPalabras} onChangeText={setRegistroPalabras} placeholder="¿Repitió las palabras con éxito?..." />

            <Text style={styles.inputLabel}>3-Cálculo</Text>
            <TextInput style={styles.input} value={calculo} onChangeText={setCalculo} placeholder="¿Resta 100 - 7?..." />

            <Text style={styles.inputLabel}>4-Memoria</Text>
            <TextInput style={styles.input} value={memoria} onChangeText={setMemoria} placeholder="¿Recordó las palabras del registro?..." />

            <Text style={styles.inputLabel}>5-Lenguaje y praxia</Text>
            <TextInput style={styles.input} value={lenguajePraxia} onChangeText={setLenguajePraxia} placeholder="Realizó la prueba con éxito" />

            <Text style={styles.inputLabel}>c) Observaciones</Text>
            <TextInput style={styles.input} value={observaciones} onChangeText={setObservaciones} placeholder="Las restas las realizó lento" />

            <Text style={styles.inputLabel}>d) Puntuación</Text>
            <TextInput style={styles.input} value={puntuacion} onChangeText={setPuntuacion} placeholder=">24 puntos" keyboardType="numeric" />

            <View style={styles.fixToText}>
              <Button title="Aceptar" onPress={handleAceptar} color="purple" />
              <Button title="Regresar" onPress={() => Alert.alert('Regresar')} color="purple" />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
    backgroundColor: '#ffe5ff',
  },
  textContainer: {
    padding: 20,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputLabel: {
    marginLeft: 4,
    marginTop: 10,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingHorizontal: 20,
  },
});

export default PantallaPruebaMiniMental;
