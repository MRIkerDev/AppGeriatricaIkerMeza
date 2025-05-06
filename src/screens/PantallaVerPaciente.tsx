import React from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';

const PantallaVerPaciente = ({ route, navigation }: any) => {
  const { paciente } = route.params;
  let antecedentes = paciente.antecedentes;

if (typeof antecedentes === 'string') {
  try {
    antecedentes = JSON.parse(antecedentes);
  } catch {
    antecedentes = {};
  }
}

const antecedentesTexto = Object.entries(antecedentes)
  .filter(([_, val]) => val)
  .map(([key]) => key)
  .join(', ') || 'Ninguno';
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Información del Paciente</Text>
      <Text style={styles.label}>Nombre:</Text>
      <Text style={styles.value}>{paciente.nombre || 'No registrado'}</Text>

      <Text style={styles.label}>Edad:</Text>
      <Text style={styles.value}>{paciente.edad || 'No registrado'}</Text>

      <Text style={styles.label}>Fecha de Nacimiento:</Text>
      <Text style={styles.value}>{paciente.fechaNacimiento || 'No registrado'}</Text>

      <Text style={styles.label}>Lugar de Nacimiento:</Text>
      <Text style={styles.value}>{paciente.lugarNacimiento || 'No registrado'}</Text>

      <Text style={styles.label}>Estado Civil:</Text>
      <Text style={styles.value}>{paciente.estadoCivil   || 'No registrado'}</Text>

      <Text style={styles.label}>Cuidador Principal:</Text>
      <Text style={styles.value}>{paciente.cuidador || 'No registrado'}</Text>

      <Text style={styles.label}>Escolaridad:</Text>
      <Text style={styles.value}>{paciente.escolaridad || 'No registrado'}</Text>

      <Text style={styles.label}>Ocupación Actual:</Text>
      <Text style={styles.value}>{paciente.ocupacion || 'No registrado'}</Text>

      <Text style={styles.label}>Enfermedades:</Text>
      <Text style={styles.value}>{paciente.enfermedades || 'No registrado'}</Text>

      <Text style={styles.label}>Antecedentes:</Text>
      <Text style={styles.value}>

        {antecedentesTexto || 'Ninguno'}
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Ir a Pruebas"
          onPress={() =>
           {
            console.log('pacienteId:', paciente.id, 'pacienteNombre:', paciente.nombre);
            navigation.navigate('PantallaPruebas', {
              pacienteId: paciente.id,
              pacienteNombre: paciente.nombre,
            });

          }
        }
        />
        <Button
          title="Ver Historial de Pruebas"
          color="green"
          onPress={() =>
            navigation.navigate('PantallaHistorialPruebas', {
              pacienteId: paciente.id,
              pacienteNombre: paciente.nombre,
            })
          }
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'purple',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: 30,
  },
});

export default PantallaVerPaciente;
