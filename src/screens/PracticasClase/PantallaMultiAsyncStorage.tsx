// PantallaMultiAsyncStorage.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PantallaMultiAsyncStorage = () => {
  const [datos, setDatos] = useState<{
    nombre?: string;
    edad?: string;
    profesion?: string;
    correo?: string;
  }>({});

  const guardarVarios = async () => {
    try {
      await AsyncStorage.multiSet([
        ['nombre', 'Iker Meza'],
        ['edad', '21'],
        ['profesion', 'Ingeniero'],
        ['correo', 'ikermeza@lapaz.tecnm.mx'],
      ]);
      Alert.alert('Datos guardados correctamente');
    } catch (e) {
      console.error('Error al guardar múltiples:', e);
    }
  };

  // Función para leer varios datos guardados con sus claves
  const leerVarios = async () => {
    try {
      const resultado = await AsyncStorage.multiGet([
        'nombre',
        'edad',
        'profesion',
        'correo',
      ]);

      const obj: Record<string, string | null> = {};
      resultado.forEach(([clave, valor]) => {
        obj[clave] = valor;
      });

      setDatos(obj);
    } catch (e) {
      console.error('Error al leer múltiples:', e);
    }
  };

  useEffect(() => {
    leerVarios();
  }, []);

  return (
    <View style={styles.container}>
      <Button title="Guardar múltiples valores" onPress={guardarVarios} />
      <Button title="Leer múltiples valores" onPress={leerVarios} />
      <Text style={styles.text}>Nombre: {datos.nombre}</Text>
      <Text style={styles.text}>Edad: {datos.edad}</Text>
      <Text style={styles.text}>Profesión: {datos.profesion}</Text>
      <Text style={styles.text}>Correo: {datos.correo}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 50 },
  text: { fontSize: 16, marginVertical: 5 },
});

export default PantallaMultiAsyncStorage;
