import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button, Alert, ScrollView } from 'react-native';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { hayInternet } from '../../../utils/checarInternet';

type NavigationProps = {
  navigation: any;
  route: any;
};

const PantallaPruebaVisual = ({ navigation, route }: NavigationProps) => {
  const { pacienteId } = route.params;
  const [odRosenbaum, setOdRosenbaum] = useState('');
  const [oiRosenbaum, setOiRosenbaum] = useState('');
  const [odSnellen, setOdSnellen] = useState('');
  const [oiSnellen, setOiSnellen] = useState('');

  const calcularResultado = async () => {
    try{



    const resultadoRosenbaumOd = parseFloat(odRosenbaum);
    const resultadoRosenbaumOi = parseFloat(oiRosenbaum);
    const resultadoSnellenOd = parseFloat(odSnellen);
    const resultadoSnellenOi = parseFloat(oiSnellen);

    let mensaje = 'Resultados: \n';
    let total = 0;

    // Rosenbaum
    if (
      !isNaN(resultadoRosenbaumOd) &&
      !isNaN(resultadoRosenbaumOi) &&
      resultadoRosenbaumOd <= 20 &&
      resultadoRosenbaumOi <= 20
    ) {
      mensaje += '✅ Ambos ojos tienen visión normal en Rosenbaum.\n';
    } else {
      mensaje += '⚠️ Puede haber un déficit visual con Rosenbaum.\n';
      total += 1;
    }

    // Snellen
    if (
      !isNaN(resultadoSnellenOd) &&
      !isNaN(resultadoSnellenOi) &&
      resultadoSnellenOd === 6 &&
      resultadoSnellenOi === 6
    ) {
      mensaje += '✅ Ambos ojos tienen visión normal en Snellen.';
    } else {
      mensaje += '⚠️ Puede haber un déficit visual con Snellen.';
      total += 1;
    }

    Alert.alert('Resultado', mensaje);
    await guardarResultado(pacienteId, 'Vision', total);
    const hayNet = await hayInternet();
    if (hayNet) {
      guardarPruebaFirebase(pacienteId, 'Vision', total);
      return;
     }
    // Navegar y pasar el resultado
    navigation.navigate('PantallaPruebas', { total: total, pacienteId: pacienteId });
    } catch (error) {
      console.error('Error al guardar el resultado:', error);
      Alert.alert('Error al guardar el resultado');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Valoración visual con cartilla de bolsillo</Text>

      <Text style={styles.subtitle}>Resultados de la prueba de agudeza visual</Text>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Cartilla de Rosenbaum:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Agudeza visual OD"
          value={odRosenbaum}
          onChangeText={setOdRosenbaum}
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Agudeza visual OI"
          value={oiRosenbaum}
          onChangeText={setOiRosenbaum}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Cartilla de Snellen:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Agudeza visual OD"
          value={odSnellen}
          onChangeText={setOdSnellen}
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Agudeza visual OI"
          value={oiSnellen}
          onChangeText={setOiSnellen}
        />
      </View>

      <Button title="Calcular resultado" onPress={calcularResultado} color="#BE427B" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#BE427B',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: '100%',
  },
  card: {
    padding: 20,
    marginBottom: 20,
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
});

export default PantallaPruebaVisual;
