// PantallaAsyncStorage.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PantallaAsyncStorage = () => {
  const [nombre, setNombre] = useState('');
  const [nombreGuardado, setNombreGuardado] = useState('');

  const guardarNombre = async () => {
    try {
      await AsyncStorage.setItem('usuario', nombre);
      Alert.alert('Nombre guardado');
      leerNombre();
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const leerNombre = async () => {
    try {
      const valor = await AsyncStorage.getItem('usuario');
      if (valor !== null) {
        setNombreGuardado(valor);
      }
    } catch (error) {
      console.error('Error al leer:', error);
    }
  };

  useEffect(() => {
    leerNombre();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ingresa tu nombre:</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe aquí"
        value={nombre}
        onChangeText={setNombre}
      />
      <Button title="Guardar nombre" onPress={guardarNombre} />
      <Text style={styles.resultado}>Nombre guardado: {nombreGuardado}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 50 },
  label: { fontSize: 18 },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    marginBottom: 10,
    padding: 8,
  },
  resultado: { marginTop: 20, fontSize: 16, color: 'green' },
});

export default PantallaAsyncStorage;


