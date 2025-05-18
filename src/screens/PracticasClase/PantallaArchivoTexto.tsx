// ArchivoTexto.tsx
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import RNFS from 'react-native-fs';

const PantallaArchivoTexto = () => {
  const [contenido, setContenido] = useState('');

  const rutaArchivo = `${RNFS.DocumentDirectoryPath}/tec.txt`;

  const escribirArchivo = async () => {
    try {
      const texto = 'Este es un archivo de texto creado desde React Native.';
      await RNFS.writeFile(rutaArchivo, texto, 'utf8');
      Alert.alert('Archivo creado', 'El archivo ha sido guardado exitosamente.');
    } catch (error: any) {
      Alert.alert('Error al escribir', error.message);
    }
  };

  const leerArchivo = async () => {
    try {
      const existe = await RNFS.exists(rutaArchivo);
      if (!existe) {
        Alert.alert('Error', 'El archivo no existe');
        return;
      }
      const texto = await RNFS.readFile(rutaArchivo, 'utf8');
      setContenido(texto);
    } catch (error: any) {
      Alert.alert('Error al leer', error.message);
    }
  };

  const eliminarArchivo = async () => {
    try {
      await RNFS.unlink(rutaArchivo);
      setContenido('');
      Alert.alert('Archivo eliminado');
    } catch (error: any) {
      Alert.alert('Error al eliminar', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Manipulación de Archivos</Text>
      <Button title="Escribir archivo" onPress={escribirArchivo} />
      <Button title="Leer archivo" onPress={leerArchivo} />
      <Button title="Eliminar archivo" onPress={eliminarArchivo} />
      <Text style={styles.texto}>{contenido}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  titulo: { fontSize: 20, marginBottom: 20, textAlign: 'center' },
  texto: { marginTop: 20, fontSize: 16, textAlign: 'center' },
});

export default PantallaArchivoTexto;
