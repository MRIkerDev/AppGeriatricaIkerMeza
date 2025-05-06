import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const PantallaPruebaCESD7 = ({ navigation }: any) => {

  const questions = [
    '1. ¿Se sintió decaído(a)?',
    '2. ¿Tuvo problemas para dormir bien?',
    '3. ¿Se sintió solo(a)?',
    '4. ¿Se sintió triste?',
    '5. ¿Sintió que todo lo que hacía era un esfuerzo?',
    '6. ¿Sintió que no podía seguir con su vida?',
    '7. ¿Estuvo molesto(a) o irritable?',
  ];

  const [answers, setAnswers] = useState(Array(7).fill(''));
  const [score, setScore] = useState(null);
  const [hasSymptoms, setHasSymptoms] = useState<boolean | null>(null);


  const getPoints = (response: any) => {
    switch (response.toLowerCase().trim()) {
      case 'rara vez':
      case 'rara vez o nunca':
        return 0;
      case 'pocas veces':
        return 1;
      case 'considerable':
        return 2;
      case 'todo el tiempo':
        return 3;
      default:
        return 0;
    }
  };

  const evaluar = () => {
    const total = answers.reduce((acc, curr) => acc + getPoints(curr), 0);
    setScore(total);
    setHasSymptoms(total >= 5);

    // Navegar y devolver puntuación a pantalla anterior
    navigation.navigate('PantallaPruebas', {total: total });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{'\n'}Escala CESD-7 - Evaluación de Síntomas Depresivos</Text>

      <Text style={styles.instructions}>
        Indique cómo se ha sentido durante la última semana. Responda según la frecuencia:
      </Text>
      <Text style={styles.options}>
        ■ Rara vez o nunca (0 puntos){'\n'}
        ■ Pocas veces (1 punto){'\n'}
        ■ Considerable (2 puntos){'\n'}
        ■ Todo el tiempo (3 puntos){'\n'}
      </Text>

      {questions.map((q, index) => (
        <View key={index} style={styles.questionContainer}>
          <Text style={styles.questionText}>{q}</Text>
          <TextInput
            style={styles.input}
            placeholder="Respuesta (ej. Rara vez, Pocas veces...)"
            value={answers[index]}
            onChangeText={(text) => {
              const updated = [...answers];
              updated[index] = text;
              setAnswers(updated);
            }}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={evaluar}>
        <Text style={styles.buttonText}>Evaluar</Text>
      </TouchableOpacity>

      {score !== null && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Resultado:</Text>
          <Text style={styles.resultText}>
            {hasSymptoms
              ? '⚠️ Indicios de síntomas depresivos significativos.'
              : '✅ Sin síntomas depresivos importantes.'}
          </Text>
          <Text style={styles.subResultText}>Puntuación total: {score} puntos</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#83c0df',
  },
  instructions: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  options: {
    fontSize: 14,
    color: '#444',
    marginBottom: 20,
    backgroundColor: '#e2e7f3',
    padding: 10,
    borderRadius: 6,
  },
  questionContainer: {
    marginBottom: 15,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 10,
  },
  button: {
    backgroundColor: '#688db9',
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#e2e7f3',
    borderRadius: 8,
  },
  resultTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: '#018dc7',
  },
  resultText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 10,
  },
  subResultText: {
    fontSize: 14,
    color: '#666',
  },
});

export default PantallaPruebaCESD7;
