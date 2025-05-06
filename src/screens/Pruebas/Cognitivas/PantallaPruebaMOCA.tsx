import React, { useState } from 'react';
import { ImageBackground, Button, StyleSheet, Text, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';

const PantallaPruebaMOCA = ({ navigation,route }: any) => {
  const { pacienteId } = route.params;
  const [nombrePaciente] = useState('');
  const [orientacion, setOrientacion] = useState('');
  const [atencion, setAtencion] = useState('');
  const [memoria, setMemoria] = useState('');
  const [lenguaje, setLenguaje] = useState('');
  const [funcionesEjecutivas, setFuncionesEjecutivas] = useState('');
  const [abstraccion, setAbstraccion] = useState('');
  const [denominacion, setDenominacion] = useState('');
  const [recuerdoDiferido, setRecuerdoDiferido] = useState('');
  const [puntajeFinal, setPuntajeFinal] = useState('');

  const image = { uri: 'https://img.freepik.com/vector-gratis/fondo-elegante-patron-damasco-marco-dorado_1048-20169.jpg?semt=ais_hybrid' };

  const handleSubmit = async() => {
    try {
    Alert.alert('Formulario enviado', `Paciente: ${nombrePaciente}, Puntaje Final: ${puntajeFinal}`);

    await guardarResultado(pacienteId, 'MOCA', parseInt(puntajeFinal)); // SQLite
    await guardarPruebaFirebase(pacienteId, 'MOCA', parseInt(puntajeFinal));
    navigation.navigate('PantallaPruebas', {total: puntajeFinal });
    } catch (error) {
      console.error('Error al guardar el resultado:', error);
      Alert.alert('Error al guardar el resultado');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ImageBackground source={image} resizeMode="cover" style={styles.image}>
          <ScrollView contentContainerStyle={styles.overlay}>
            <Text style={styles.title}>Evaluación Cognitiva de Montreal (MoCA)</Text>

            <Text style={styles.subtitle}>Resultados de la Prueba</Text>

               <Text style={styles.description}>Funciones Ejecutivas: Prueba de habilidades como la planificación y el pensamiento abstracto.</Text>
            <TextInput style={styles.input} onChangeText={setFuncionesEjecutivas} value={funcionesEjecutivas} placeholder="Puntaje" keyboardType="numeric" />

              <Text style={styles.description}>Denominación: Identificación correcta de imágenes de objetos comunes.</Text>
            <Text style={styles.description}>Ejemplo: "Plátano", "Zapato", "Mesa". Si el paciente responde correctamente, vale 1 punto por cada objeto identificado correctamente.</Text>
            <TextInput style={styles.input} onChangeText={setDenominacion} value={denominacion} placeholder="Puntaje" keyboardType="numeric" />

            <Text style={styles.description}>Orientación: Evaluar si el paciente puede identificar la fecha, el día de la semana, el lugar y la ciudad.</Text>
            <TextInput style={styles.input} onChangeText={setOrientacion} value={orientacion} placeholder="Puntaje" keyboardType="numeric" />

                    <Text style={styles.description}>Memoria: Se presentan palabras al paciente y se le pide que las recuerde más tarde.</Text>
            <TextInput style={styles.input} onChangeText={setMemoria} value={memoria} placeholder="Puntaje" keyboardType="numeric" />


            <Text style={styles.description}>Atención: Se evalúa la capacidad de concentración mediante tareas como repetir números o restar de 7 en 7.</Text>
            <TextInput style={styles.input} onChangeText={setAtencion} value={atencion} placeholder="Puntaje" keyboardType="numeric" />



            <Text style={styles.description}>Lenguaje: Evaluación de la fluidez verbal y la capacidad de repetir frases complejas.</Text>
            <TextInput style={styles.input} onChangeText={setLenguaje} value={lenguaje} placeholder="Puntaje" keyboardType="numeric" />



            <Text style={styles.description}>Abstracción: Se le pide al paciente que encuentre similitudes entre dos palabras (ej. naranja y plátano, cacahuate y banana).</Text>
            <Text style={styles.description}>Si el paciente responde correctamente, vale 1 punto por cada par de palabras similarmente respondido.</Text>
            <TextInput style={styles.input} onChangeText={setAbstraccion} value={abstraccion} placeholder="Puntaje" keyboardType="numeric" />



            <Text style={styles.description}>Recuerdo Diferido: Evaluar si el paciente recuerda palabras presentadas previamente.</Text>
            <TextInput style={styles.input} onChangeText={setRecuerdoDiferido} value={recuerdoDiferido} placeholder="Puntaje" keyboardType="numeric" />

            <Text style={styles.subtitle}>Puntaje Final</Text>
            <TextInput style={styles.input} onChangeText={setPuntajeFinal} value={puntajeFinal} placeholder="Puntaje Total" keyboardType="numeric" />

            <Button title="Enviar Evaluación" onPress={handleSubmit} />
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderColor: '#20232a',
    backgroundColor: '#61dafb',
     color: '#20232a',
    width: '90%',
    padding: 10,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    marginTop: 16,
    paddingVertical: 8,
    borderWidth: 4,
    borderColor: '#20232a',
    borderRadius: 6,
    backgroundColor: '#61dafb',
    color: '#20232a',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    color: '#ffffff',
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    color: '#ffffff',
    marginVertical: 5,
    textAlign: 'center',
  },
});

export default PantallaPruebaMOCA;
