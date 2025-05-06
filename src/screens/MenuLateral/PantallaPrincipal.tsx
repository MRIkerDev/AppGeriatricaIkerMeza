import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const PantallaPrincipal = ({ navigation, route }: any) => {
  const [pacientes, setPacientes] = useState<any[]>([]);

  useEffect(() => {
    const paciente = route.params?.nuevoPaciente;
    if (paciente) {
      setPacientes((prev) => {
        const yaExiste = prev.some(
          (p) => p.nombre === paciente.nombre && p.edad === paciente.edad
        );
        if (yaExiste) {return prev;}

        return [
          ...prev,
          {
            id: (prev.length + 1).toString(),
            ...paciente,
          },
        ];
      });
    }
  }, [route.params]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Pacientes</Text>
      <FlatList
        data={pacientes}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('DetallePaciente', {
                pacienteId: item.id,
                ...item,
              })
            }
          >
            <Text style={styles.itemText}>{item.nombre}</Text>
            <Text style={styles.itemSubText}>Edad: {item.edad}</Text>
            <Text style={styles.itemSubText}>Fecha Nac.: {item.fechaNacimiento}</Text>
            <Text style={styles.itemSubText}>Estado Civil: {item.estadoCivil}</Text>
            <Text style={styles.itemSubText}>Cuidador: {item.cuidadorPrincipal}</Text>
            <Text style={styles.itemSubText}>Escolaridad: {item.escolaridad}</Text>
            <Text style={styles.itemSubText}>Ocupación: {item.ocupacionActual}</Text>
            <Text style={styles.itemSubText}>Enfermedades: {item.enfermedades}</Text>
            <Text style={styles.itemSubText}>
              Antecedentes:{' '}
              {Object.entries(item.antecedentes)
                .filter(([_, val]) => val)
                .map(([key]) => key)
                .join(', ') || 'Ninguno'}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay pacientes registrados aún.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  itemText: {
    fontSize: 18,
    color: '#333',
  },
  itemSubText: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 16,
    marginTop: 50,
  },
});

export default PantallaPrincipal;
