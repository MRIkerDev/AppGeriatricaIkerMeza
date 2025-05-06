import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';

const preguntasGDS15 = [
  { id: '1', texto: '¿Está básicamente satisfecho con su vida?' },
  { id: '2', texto: '¿Ha renunciado a muchas de sus actividades o intereses?' },
  { id: '3', texto: '¿Siente que su vida está vacía?' },
  { id: '4', texto: '¿Se siente a menudo aburrido?' },
  { id: '5', texto: '¿Está de buen humor la mayor parte del tiempo?' },
  { id: '6', texto: '¿Teme que algo malo le va a pasar?' },
  { id: '7', texto: '¿Se siente feliz la mayor parte del tiempo?' },
  { id: '8', texto: '¿Se siente a menudo desamparado?' },
  { id: '9', texto: '¿Prefiere quedarse en casa en vez de salir y hacer cosas nuevas?' },
  { id: '10', texto: '¿Cree que tiene más problemas de memoria que la mayoría?' },
  { id: '11', texto: '¿Piensa que es maravilloso estar vivo en este momento?' },
  { id: '12', texto: '¿Se siente inútil en este momento?' },
  { id: '13', texto: '¿Se siente lleno de energía?' },
  { id: '14', texto: '¿Siente que su situación es desesperada?' },
  { id: '15', texto: '¿Piensa que la mayoría de las personas están mejor que usted?' },
];

const PantallaPruebaGDS15 = ({ navigation, route }: any) => {
  const [respuestas, setRespuestas] = useState<RespuestasGDS15>({});
  const { pacienteId } = route.params;

  const handleRespuesta = (id: string, respuesta: 'Sí' | 'No') => {
    setRespuestas(prev => ({ ...prev, [id]: respuesta }));
  };
  type RespuestasGDS15 = {
    [key: string]: 'Sí' | 'No';
  };
  const calcularResultado = () => {
    return preguntasGDS15.reduce((total, pregunta) => {
      const respuesta = respuestas[pregunta.id];
      if (
        (['1', '5', '7', '11', '13'].includes(pregunta.id) && respuesta === 'No') ||
        (!['1', '5', '7', '11', '13'].includes(pregunta.id) && respuesta === 'Sí')
      ) {
        return total + 1;
      }
      return total;
    }, 0);
  };

  const handleRegistrar = async () => {
    try{
      guardarResultado(pacienteId, 'GDS-15', calcularResultado());
      guardarPruebaFirebase(pacienteId, 'GDS-15', calcularResultado());
      const resultado = calcularResultado();
      Alert.alert('Resultado', `El puntaje de la prueba GDS-15 es: ${resultado}`);
      navigation.navigate('PantallaPruebas', { total: resultado, pacienteId });
    } catch (error) {
      console.error('Error al registrar resultado:', error);
      Alert.alert('Error al registrar resultado');
    }
  };

  return (
    <ScrollView style={estilos.container}>
      <Text style={estilos.titulo}>Formulario GDS-15</Text>



      <Text style={estilos.subtitulo}>Preguntas de la escala:</Text>

      {preguntasGDS15.map(p => (
        <View key={p.id} style={estilos.pregunta}>
          <Text style={estilos.textoPregunta}>{p.texto}</Text>
          <View style={estilos.opciones}>
            <Pressable
              style={[estilos.opcion, respuestas[p.id] === 'Sí' && estilos.opcionSeleccionada]}
              onPress={() => handleRespuesta(p.id, 'Sí')}>
              <Text style={estilos.opcionTexto}>Sí</Text>
            </Pressable>
            <Pressable
              style={[estilos.opcion, respuestas[p.id] === 'No' && estilos.opcionSeleccionada]}
              onPress={() => handleRespuesta(p.id, 'No')}>
              <Text style={estilos.opcionTexto}>No</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <Pressable style={estilos.boton} onPress={handleRegistrar}>
        <Text style={estilos.botonTexto}>Registrar datos</Text>
      </Pressable>
    </ScrollView>
  );
};
const estilos = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0fdf4',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1b4332',
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#1b4332',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 10,
    backgroundColor: 'white',
  },
  pregunta: {
    marginBottom: 15,
  },
  textoPregunta: {
    fontSize: 16,
    marginBottom: 5,
  },
  opciones: {
    flexDirection: 'row',
    gap: 10,
  },
  opcion: {
    backgroundColor: '#d8f3dc',
    padding: 15,
    borderRadius: 5,
    paddingHorizontal: 35,
  },
  opcionSeleccionada: {
    backgroundColor: '#40916c',
  },
  opcionTexto: {
    color: '#000',
  },
  boton: {
    backgroundColor: '#52b788',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 50,
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PantallaPruebaGDS15;
