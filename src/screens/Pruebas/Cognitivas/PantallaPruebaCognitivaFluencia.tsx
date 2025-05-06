import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, SafeAreaView, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const CATEGORIAS = ['animales', 'supermercado', 'frutas'] as const;
const FILAS_TOTALES = 15;

type Categoria = (typeof CATEGORIAS)[number]; 
type EntradaPalabra = { animales: string; supermercado: string; frutas: string }; 

const PantallaPruebaCognitivaFluencia = ({ navigation }: any) => {
  const [Total, setTotal] = useState(0);
  const [Aciertos, setAciertos] = useState(0);
  const [Errores, setErrores] = useState(0);

  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [palabras, setPalabras] = useState<EntradaPalabra[]>(Array.from({ length: FILAS_TOTALES }, () => ({ animales: '', supermercado: '', frutas: '' })));
  const [pruebaTerminada, setPruebaTerminada] = useState(false);

  useEffect(() => {
    if (tiempoRestante > 0) {
      const temporizador = setTimeout(() => setTiempoRestante(tiempoRestante - 1), 1000);
      return () => clearTimeout(temporizador);
    } else {
      setPruebaTerminada(true);
    }
  }, [tiempoRestante]);

  const manejarCambioInput = (texto: string, indiceFila: number, categoria: Categoria) => {
    const nuevasPalabras = [...palabras];
    nuevasPalabras[indiceFila] = { ...nuevasPalabras[indiceFila], [categoria]: texto }; 
    setPalabras(nuevasPalabras);
  };

  const manejarAciertos = (valor: string) => {
    const aciertos = parseInt(valor) || 0;
    setAciertos(aciertos);
    setTotal(aciertos - Errores); 
  };

  const manejarErrores = (valor: string) => {
    const errores = parseInt(valor) || 0;
    setErrores(errores);
    setTotal(Aciertos - errores); 
  };

  const manejarEnvio = () => {
    navigation.navigate('PantallaPruebas', { total: Total });
    Alert.alert('Respuestas guardadas correctamente');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={estilos.contenedor}>
        <Text style={estilos.titulo}>Prueba de Fluencia Verbal</Text>
        <Text style={estilos.temporizador}>Tiempo restante: {tiempoRestante} segundos</Text>
        <ScrollView>
          <View style={estilos.contenedorTabla}>
            <View style={estilos.cabeceraTabla}>
              <Text style={estilos.celdaCabecera}>#</Text>
              {CATEGORIAS.map((categoria) => (
                <Text key={categoria} style={estilos.celdaCabecera}>{categoria}</Text>
              ))}
            </View>
            {palabras.map((_, indice) => (
              <View key={indice} style={estilos.filaTabla}>
                <Text style={estilos.celda}>{indice + 1}</Text>
                {CATEGORIAS.map((categoria) => (
                  <TextInput
                    key={categoria}
                    style={estilos.input}
                    editable={!pruebaTerminada}
                    onChangeText={(texto) => manejarCambioInput(texto, indice, categoria)}
                    value={palabras[indice][categoria]}
                  />
                ))}
              </View>
            ))}
          </View>

          <SafeAreaView style={estilos.resultados}>
            <Text style={estilos.resultados}>Aciertos:</Text>
            <TextInput
              style={estilos.resultados}
              placeholder="No. Aciertos"
              keyboardType="numeric"
              onChangeText={manejarAciertos}
            />
            <Text style={estilos.resultados}>Errores:</Text>
            <TextInput
              style={estilos.resultados}
              placeholder="No. Errores"
              keyboardType="numeric"
              onChangeText={manejarErrores}
            />
            <Text style={estilos.resultados}>Total:</Text>
            <TextInput
              style={estilos.resultados}
              value={Total.toString()}
              editable={false} 
            />
          </SafeAreaView>

          <Button title="Guardar Respuestas" onPress={manejarEnvio} disabled={!pruebaTerminada} />
          <Button title="Regresar a la pantalla principal" onPress={() => navigation.navigate('PantallaPrincipal')} />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const estilos = StyleSheet.create({
  contenedor: { flex: 1, padding: 0, backgroundColor: '#f5f5f5' },
  resultados: { flexDirection: 'row', padding: 10, backgroundColor: '#f5f5f5', marginTop: 1,fontSize:20 },
  resultadosInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 5, textAlign: 'center', marginLeft: 10 },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  temporizador: { fontSize: 18, textAlign: 'center', marginBottom: 10, color: 'red' },
  contenedorTabla: { flexDirection: 'column', marginBottom: 20, paddingLeft: 0 },
  cabeceraTabla: { flexDirection: 'row', backgroundColor: '#ddd', padding: 10 },
  celdaCabecera: { flex: 1, fontWeight: 'bold', textAlign: 'center', marginHorizontal: 15 },
  filaTabla: { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 5 },
  celda: { flex: 0.5, textAlign: 'center', paddingVertical: 5 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 5, textAlign: 'center' },
});

export default PantallaPruebaCognitivaFluencia;
