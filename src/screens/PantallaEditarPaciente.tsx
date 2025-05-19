// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Switch } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { editarPaciente } from '../database/database';
import { editarPacienteFirebase } from '../utils/firebaseService';

const PantallaEditarPaciente = ({ route, navigation }: any) => {
  const { pacienteId, paciente } = route.params;

  const [nombre, setNombre] = useState(paciente.nombre);
  const [edad, setEdad] = useState(paciente.edad.toString());
  const [fechaNacimiento, setFechaNacimiento] = useState(paciente.fechaNacimiento);
  const [lugarNacimiento, setLugarNacimiento] = useState(paciente.lugarNacimiento || '');
  const [estadoCivil, setEstadoCivil] = useState(paciente.estadoCivil);
  const [cuidador, setCuidador] = useState(paciente.cuidador);
  const [escolaridad, setEscolaridad] = useState(paciente.escolaridad);
  const [ocupacion, setOcupacion] = useState(paciente.ocupacion);
  const [enfermedades, setEnfermedades] = useState(paciente.enfermedades);

  // Antecedentes
  const antecedentes = paciente.antecedentes || {};
  const [tabaquismo, setTabaquismo] = useState(antecedentes.tabaquismo || false);
  const [alcoholismo, setAlcoholismo] = useState(antecedentes.alcoholismo || false);
  const [biomasa, setBiomasa] = useState(antecedentes.biomasa || false);
  const [combe, setCombe] = useState(antecedentes.combe || false);
  const [vacunas, setVacunas] = useState(antecedentes.vacunas || false);
  const [cirugias, setCirugias] = useState(antecedentes.cirugias || false);
  const [transfusiones, setTransfusiones] = useState(antecedentes.transfusiones || false);
  const [fracturas, setFracturas] = useState(antecedentes.fracturas || false);
  const [alergias, setAlergias] = useState(antecedentes.alergias || false);

  const guardarCambios = async () => {
    const pacienteActualizado = {
      id: pacienteId,
      nombre,
      edad: parseInt(edad),
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
      await editarPaciente(pacienteActualizado);
      const estado = await NetInfo.fetch();
      if (estado.isConnected) {
       await editarPacienteFirebase(pacienteId, pacienteActualizado);
        console.log('Paciente actualizado también en Firebase');
      }

      Alert.alert('Éxito', 'Paciente actualizado con éxito');
      navigation.goBack();
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'Hubo un error al actualizar el paciente');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar Paciente</Text>
      <Button title="Guardar Cambios" onPress={guardarCambios} />
      <Text style={styles.label}>Nombre Completo:</Text>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre" />

      <Text style={styles.label}>Edad:</Text>
      <TextInput style={styles.input} value={edad} onChangeText={setEdad} keyboardType="numeric" />

      <Text style={styles.label}>Fecha de Nacimiento:</Text>
      <TextInput style={styles.input} value={fechaNacimiento} onChangeText={setFechaNacimiento} />

      <Text style={styles.label}>Lugar de Nacimiento:</Text>
      <TextInput style={styles.input} value={lugarNacimiento} onChangeText={setLugarNacimiento} />

      <Text style={styles.label}>Estado Civil:</Text>
      <TextInput style={styles.input} value={estadoCivil} onChangeText={setEstadoCivil} />

      <Text style={styles.label}>Cuidador:</Text>
      <TextInput style={styles.input} value={cuidador} onChangeText={setCuidador} />

      <Text style={styles.label}>Escolaridad:</Text>
      <TextInput style={styles.input} value={escolaridad} onChangeText={setEscolaridad} />

      <Text style={styles.label}>Ocupación:</Text>
      <TextInput style={styles.input} value={ocupacion} onChangeText={setOcupacion} />

      <Text style={styles.label}>Antecedentes Personales No Patológicos:</Text>
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

      <Text style={styles.label}>Enfermedades:</Text>
      <TextInput style={styles.input} value={enfermedades} onChangeText={setEnfermedades} />


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16,
  },
  checkboxItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    fontSize: 16,
  },
});

export default PantallaEditarPaciente;
