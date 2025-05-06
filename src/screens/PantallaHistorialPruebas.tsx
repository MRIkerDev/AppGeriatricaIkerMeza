import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { obtenerResultadosPorPaciente } from '../database/database';

const PantallaHistorialPruebas = ({ route }: any) => {
  const { pacienteId, pacienteNombre } = route.params;
  const [resultados, setResultados] = useState<any[]>([]);

  useEffect(() => {
    const cargarResultados = async () => {
      const data = await obtenerResultadosPorPaciente(pacienteId);
      setResultados(data);
    };

    cargarResultados();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Pruebas de {pacienteNombre}</Text>
      <FlatList
        data={resultados}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.resultado}>
            <Text style={styles.text}>🧠 {item.nombrePrueba}</Text>
            <Text style={styles.text}>Puntaje: {item.puntaje}</Text>
            <Text style={styles.text}>Fecha: {new Date(item.fecha).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: 'purple' },
  resultado: { marginBottom: 15, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  text: { fontSize: 16 },
});

export default PantallaHistorialPruebas;
