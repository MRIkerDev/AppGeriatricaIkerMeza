import React, { useState } from 'react';
import { guardarPaciente, marcarPacienteComoSincronizado } from '../../database/database';
import { hayInternet } from '../../utils/checarInternet';
import { guardarPacienteFirebase } from '../../utils/firebaseService'; // Función para guardar en Firebase

import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';

const PantallaAgregarPaciente = ({ navigation }: any) => {
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [enfermedades, setEnfermedades] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [lugarNacimiento, setLugarNacimiento] = useState('');
  const [estadoCivil, setEstadoCivil] = useState('');
  const [cuidador, setCuidador] = useState('');
  const [escolaridad, setEscolaridad] = useState('');
  const [ocupacion, setOcupacion] = useState('');

  const [tabaquismo, setTabaquismo] = useState(false);
  const [alcoholismo, setAlcoholismo] = useState(false);
  const [biomasa, setBiomasa] = useState(false);
  const [combe, setCombe] = useState(false);
  const [vacunas, setVacunas] = useState(false);
  const [cirugias, setCirugias] = useState(false);
  const [transfusiones, setTransfusiones] = useState(false);
  const [fracturas, setFracturas] = useState(false);
  const [alergias, setAlergias] = useState(false);

  const [formVisible] = useState(true);

  const handleRegistrarPaciente = async () => {
    if (!nombre || !edad) {
      Alert.alert('Error', 'Por favor ingrese nombre y edad');
      return;
    }

    const paciente = {
      nombre,
      edad,
      fechaNacimiento,
      lugarNacimiento,
      estadoCivil,
      cuidador,
      escolaridad,
      ocupacion,
      enfermedades,
      antecedentes: {
        tabaquismo,
        alcoholismo,
        biomasa,
        combe,
        vacunas,
        cirugias,
        transfusiones,
        fracturas,
        alergias,
      },

    };

    try {
      const insertId = await guardarPaciente(paciente);

      const internetDisponible = await hayInternet();
      if (internetDisponible) {
        const pacienteConId = { id: insertId, ...paciente };
        await guardarPacienteFirebase(pacienteConId);
        await marcarPacienteComoSincronizado(insertId);
      }

      Alert.alert('Éxito', 'Paciente registrado con éxito');
      navigation.navigate('Inicio');


      // Limpiar el formulario
      setNombre('');
      setEdad('');
      setEnfermedades('');
      setFechaNacimiento('');
      setLugarNacimiento('');
      setEstadoCivil('');
      setCuidador('');
      setEscolaridad('');
      setOcupacion('');
      setTabaquismo(false);
      setAlcoholismo(false);
      setBiomasa(false);
      setCombe(false);
      setVacunas(false);
      setCirugias(false);
      setTransfusiones(false);
      setFracturas(false);
      setAlergias(false);
    } catch (error: any) {
      console.log('Error al guardar paciente:', error?.message || error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Pacientes</Text>
      {formVisible && (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.label}>Nombre Completo:</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ingrese el nombre"
          />
          <Text style={styles.label}>Edad:</Text>
          <TextInput
            style={styles.input}
            value={edad}
            onChangeText={setEdad}
            placeholder="Ingrese la edad"
            keyboardType="numeric"
          />
          <Text style={styles.label}>Fecha de Nacimiento:</Text>
          <TextInput
            style={styles.input}
            value={fechaNacimiento}
            onChangeText={setFechaNacimiento}
            placeholder="Ingrese la fecha de Nacimiento"
          />
          <Text style={styles.label}>Lugar de Nacimiento:</Text>
          <TextInput
            style={styles.input}
            value={lugarNacimiento}
            onChangeText={setLugarNacimiento}
            placeholder="Ingrese el Lugar de Nacimiento"
          />
          <Text style={styles.label}>Estado Civil:</Text>
          <TextInput
            style={styles.input}
            value={estadoCivil}
            onChangeText={setEstadoCivil}
            placeholder="Ingrese el Estado Civil"
          />
          <Text style={styles.label}>Cuidador:</Text>
          <TextInput
            style={styles.input}
            value={cuidador}
            onChangeText={setCuidador}
            placeholder="Ingrese el nombre del cuidador"
          />
          <Text style={styles.label}>Escolaridad:</Text>
          <TextInput
            style={styles.input}
            value={escolaridad}
            onChangeText={setEscolaridad}
            placeholder="Ingrese la escolaridad"
          />
          <Text style={styles.label}>Ocupación:</Text>
          <TextInput
            style={styles.input}
            value={ocupacion}
            onChangeText={setOcupacion}
            placeholder="Ingrese la ocupación"
          />
            <Text style={styles.label}>Enfermedades:</Text>
          <TextInput
            style={styles.input}
            value={enfermedades}
            onChangeText={setEnfermedades}
            placeholder="Ingrese las enfermedades"
          />
          <Text style={styles.label}>Antecedentes Personales No Patológicos:</Text>
          <View style={styles.checkboxContainer}>
            {[
              ['Tabaquismo', tabaquismo, setTabaquismo],
              ['Alcoholismo', alcoholismo, setAlcoholismo],
              ['Exposición a Biomasa', biomasa, setBiomasa],
              ['Combe', combe, setCombe],
              ['Vacunas', vacunas, setVacunas],
              ['Cirugías', cirugias, setCirugias],
              ['Transfusiones', transfusiones, setTransfusiones],
              ['Fracturas', fracturas, setFracturas],
              ['Alergias', alergias, setAlergias],
            ].map(([label, value, setter]: any, index) => (
              <View style={styles.checkboxItem} key={index}>
                <Text style={styles.checkboxLabel}>{label}</Text>
                <Switch value={value} onValueChange={setter} />
              </View>
            ))}
          </View>

          <Button title="Registrar Paciente" onPress={handleRegistrarPaciente} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  title: {
    padding: 30,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'purple',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  checkboxContainer: {
    marginVertical: 10,
  },
  checkboxItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
});

export default PantallaAgregarPaciente;
