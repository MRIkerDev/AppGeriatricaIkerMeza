import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { guardarResultado } from '../../../database/database';

const activities = [
  { id: '1', name: 'Alimentación' },
  { id: '2', name: 'Vestido' },
  { id: '3', name: 'Baño' },
  { id: '4', name: 'Continencia urinaria/fecal' },
  { id: '5', name: 'Transferencias' },
  { id: '6', name: 'Uso del sanitario' },
];

const PantallaPruebaKatz = ({ navigation, route }: any) => {
  const { pacienteId } = route.params;
  const [scores, setScores] = useState<{ [key: string]: number }>({});

  // Función para alternar entre independiente (1) y dependiente (0)
  const toggleScore = (id: string) => {
    setScores((prevScores) => ({
      ...prevScores,
      [id]: prevScores[id] === 1 ? 0 : 1, // Alterna entre 1 y 0
    }));
  };

  // Calcula el puntaje total sumando las respuestas
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  // Función para guardar y navegar al total
  const manejarEnvio = async () => {
    try {
      if (pacienteId) {
        await guardarResultado(pacienteId, 'Indice de Katz', totalScore);
        await guardarPruebaFirebase(pacienteId, 'Indice de Katz', totalScore);
        console.log('Resultado guardado exitosamente.');
      } else {
        console.warn('No se proporcionó pacienteId.');
      }

    navigation.navigate('PantallaPruebas', { total: totalScore, pacienteId: pacienteId }); // Enviar el puntaje total
    Alert.alert('Respuestas guardadas correctamente');
  } catch (error) {
    console.error('Error al guardar el resultado:', error);
    Alert.alert('Error al guardar el resultado');
  }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Índice de Katz</Text>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.activityContainer}>
            <Text style={styles.activityText}>{item.name}</Text>
            <Button
              title={scores[item.id] === 1 ? 'Independiente' : 'Dependiente'}
              color={scores[item.id] === 1 ? 'green' : 'red'}
              onPress={() => toggleScore(item.id)} // Alterna la respuesta
            />
          </View>
        )}
      />
      <Text style={styles.scoreText}>Puntaje Total: {totalScore}/6</Text>
      <Button title="Guardar Respuestas" onPress={manejarEnvio} disabled={totalScore === 0} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  activityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  activityText: {
    fontSize: 18,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PantallaPruebaKatz;
