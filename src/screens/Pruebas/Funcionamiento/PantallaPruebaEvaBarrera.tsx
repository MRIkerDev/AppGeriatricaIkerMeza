import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { hayInternet } from '../../../utils/checarInternet';

// Preguntas del formulario
const preguntas = [
  { pregunta: '¿Tiene dificultades para moverse dentro de su hogar?', tipo: 'si_no' },
  { pregunta: '¿Cuántos escalones tiene en la entrada de su hogar?', tipo: 'numerico' },
  { pregunta: 'Describa los obstáculos que dificultan su movilidad.', tipo: 'texto' },
  { pregunta: '¿Existen escalones o desniveles sin pasamanos en su hogar?', tipo: 'si_no' },
  { pregunta: '¿Cuenta con suficiente iluminación en pasillos y escaleras?', tipo: 'si_no' },
  { pregunta: '¿Tiene acceso a transporte adecuado para su movilidad?', tipo: 'si_no' },
  { pregunta: '¿Posee dispositivos auxiliares como bastón o andadera?', tipo: 'si_no' },
];

// Función para calcular la calificación
const calcularCalificacion = (respuestas: (string | number | null)[]) => {
  let puntos = 0;
  let maximo = 0;

  respuestas.forEach((respuesta, index) => {
    if (preguntas[index].tipo === 'si_no') {
      maximo += 2;
      if (respuesta === 'Sí') {puntos += 2;}
      else if (respuesta === 'No') {puntos += 1;}
    }
  });

  const calificacion = maximo > 0 ? ((puntos / maximo) * 10).toFixed(1) : '0.0';
  return calificacion;
};

const PantallaPruebaEvaBarrera = ({ navigation, route }: any) => {
  const { total: totalAnterior } = route.params || {};
  const [index, setIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<Array<string | number | null>>(
    Array(preguntas.length).fill(null)
  );
  const [calificacion] = useState<string | null>(null);
  const [total, setTotal] = useState(totalAnterior || 0); // Inicializamos el total con el valor anterior

  const handleRespuesta = (respuesta: string | number) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[index] = respuesta;
    setRespuestas(nuevasRespuestas);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/geriatrico.jpg')} style={styles.image} />
      <Text style={styles.titulo}>Evaluación de Barreras</Text>
      <Text style={styles.progreso}>Pregunta {index + 1} de {preguntas.length}</Text>
      <Text style={styles.pregunta}>{preguntas[index].pregunta}</Text>

      <View style={styles.respuestasContainer}>
        {preguntas[index].tipo === 'si_no' && (
          <>
            <TouchableOpacity
              onPress={() => handleRespuesta('Sí')}
              style={[styles.boton, respuestas[index] === 'Sí' && styles.botonActivo]}>
              <Text style={styles.botonTexto}>Sí</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleRespuesta('No')}
              style={[styles.boton, respuestas[index] === 'No' && styles.botonActivo]}>
              <Text style={styles.botonTexto}>No</Text>
            </TouchableOpacity>
          </>
        )}
        {preguntas[index].tipo === 'numerico' && (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Ingrese un número"
            onChangeText={(text) => handleRespuesta(text)}
          />
        )}
        {preguntas[index].tipo === 'texto' && (
          <TextInput
            style={styles.inputTexto}
            placeholder="Escriba su respuesta"
            multiline
            onChangeText={(text) => handleRespuesta(text)}
          />
        )}
      </View>

      <View style={styles.botonesContainer}>
        {index > 0 && <Button title="Anterior" onPress={() => setIndex(index - 1)} />}
        {index < preguntas.length - 1 ? (
          <Button title="Siguiente" onPress={() => setIndex(index + 1)} />
        ) : (
          <Button
  title="Finalizar"
  onPress={async () => {
    try {
      const calif = calcularCalificacion(respuestas);
      const nuevaTotal = total + parseFloat(calif);
      setTotal(nuevaTotal); // Actualizamos total localmente


      const pacienteId = route.params?.pacienteId;
      const hayNet = await hayInternet();
      if (hayNet) {
        guardarPruebaFirebase(pacienteId, 'Evaluacion de Barrera', parseFloat(calif));
        return;
       }
      if (pacienteId) {
        await guardarResultado(pacienteId, 'Evaluacion de Barrera', parseFloat(calif));
        console.log('Resultado guardado exitosamente.');
      } else {
        console.warn('No se proporcionó pacienteId.');
      }


      navigation.navigate('PantallaPruebas', {
        total: nuevaTotal,
      });
    } catch (error) {
      console.error('Error al guardar el resultado:', error);
      Alert.alert('Error al guardar el resultado');
    }
  }}
/>
        )}
      </View>

      {calificacion && (
        <Text style={{ marginTop: 20, fontSize: 18 }}>
          Calificación final: <Text style={{ fontWeight: 'bold' }}>{calificacion}/10</Text>
        </Text>
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Volver" onPress={() => navigation.navigate('PantallaPruebas')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', backgroundColor: '#f8f9fa', flex: 1 },
  image: { width: 150, height: 150, marginBottom: 20, borderRadius: 10 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  progreso: { fontSize: 16, marginBottom: 10, color: '#666' },
  pregunta: { fontSize: 18, textAlign: 'center', marginBottom: 20, color: '#444' },
  respuestasContainer: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 20 },
  boton: { backgroundColor: 'gray', padding: 10, borderRadius: 5, minWidth: 80, alignItems: 'center' },
  botonActivo: { backgroundColor: '#007bff' },
  botonTexto: { color: 'white', fontSize: 16 },
  input: { borderWidth: 1, borderColor: 'gray', padding: 10, borderRadius: 5, width: 150, textAlign: 'center' },
  inputTexto: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    borderRadius: 5,
    width: '90%',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  botonesContainer: { flexDirection: 'row', gap: 20 },
});

export default PantallaPruebaEvaBarrera;
