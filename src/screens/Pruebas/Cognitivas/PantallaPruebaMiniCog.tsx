import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

export default function PantallaPruebaMiniCog({ navigation }: any) {
  const [palabrasRecordadas, setPalabrasRecordadas] = useState('');
  const [puntuacionReloj, setPuntuacionReloj] = useState('');

  const handleSubmit = () => {
    const palabras = parseInt(palabrasRecordadas) || 0;
    const reloj = parseInt(puntuacionReloj) || 0;
    const total = palabras + reloj;

    Alert.alert('Evaluación completada', `Puntuación total: ${total}`);

    navigation.navigate('PantallaPruebas', { total });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.titleText}>Evaluación Mini-Cog</Text>
        <Text style={styles.subtitleText}>Prueba de memoria y función cognitiva</Text>

        <Text style={styles.label}>Recuerde estas palabras: SOL, MANO, CASA</Text>

        <Text style={styles.label}>Palabras recordadas</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese la cantidad de palabras recordadas"
          value={palabrasRecordadas}
          onChangeText={setPalabrasRecordadas}
          keyboardType="numeric"
          maxLength={1}
        />

        <Text style={styles.label}>Reloj</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese la puntuación del reloj"
          value={puntuacionReloj}
          onChangeText={setPuntuacionReloj}
          keyboardType="numeric"
          maxLength={1}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Enviar evaluación</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  scrollViewContent: { flexGrow: 1, paddingBottom: 20 },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4B0082',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    paddingLeft: 10,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4B0082',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
