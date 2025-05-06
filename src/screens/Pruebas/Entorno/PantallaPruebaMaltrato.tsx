import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';

// Tipos para cada respuesta por pregunta
type Respuesta = {
  A: '0' | '1' | '';
  B: '1' | '2' | '3' | '99' | '';
  C: '1' | '98' | '';
  D: string;
  E: '1' | '2' | '';
};

// Pregunta con categoría
type Pregunta = {
  id: string;
  texto: string;
  categoria: string;
};

const preguntas: Pregunta[] = [
  // FÍSICO
  { id: 'p1', texto: '¿Le han golpeado?', categoria: 'Físico' },
  { id: 'p2', texto: '¿Le han dado puñetazos o patadas?', categoria: 'Físico' },
  { id: 'p3', texto: '¿Le han empujado o le han jalado el pelo?', categoria: 'Físico' },
  { id: 'p4', texto: '¿Le han aventado algún objeto?', categoria: 'Físico' },
  { id: 'p5', texto: '¿Le han agredido con algún cuchillo o navaja?', categoria: 'Físico' },

  // PSICOLÓGICO
  { id: 'p6', texto: '¿Le han humillado o se han burlado de usted?', categoria: 'Psicológico' },
  { id: 'p7', texto: '¿Le han tratado con indiferencia o le han ignorado?', categoria: 'Psicológico' },
  { id: 'p8', texto: '¿Le han aislado o le han corrido de la casa?', categoria: 'Psicológico' },
  { id: 'p9', texto: '¿Le han hecho sentir miedo?', categoria: 'Psicológico' },
  { id: 'p10', texto: '¿No han respetado sus decisiones?', categoria: 'Psicológico' },
  { id: 'p11', texto: '¿Le han prohibido salir o que lo visiten?', categoria: 'Psicológico' },

  // NEGLIGENCIA
  { id: 'p12', texto: '¿Le han dejado de proporcionar ropa, calzado, etc?', categoria: 'Negligencia' },
  { id: 'p13', texto: '¿Le han dejado de suministrar medicamentos?', categoria: 'Negligencia' },
  { id: 'p14', texto: '¿Le han negado protección cuando la necesita?', categoria: 'Negligencia' },
  { id: 'p15', texto: '¿Le han negado acceso a la casa que habita?', categoria: 'Negligencia' },

  // ECONÓMICO
  { id: 'p16', texto: '¿Alguien ha manejado su dinero sin su consentimiento?', categoria: 'Económico' },
  { id: 'p17', texto: '¿Le han quitado su dinero?', categoria: 'Económico' },
  { id: 'p18', texto: '¿Le han tomado bienes sin permiso?', categoria: 'Económico' },
  { id: 'p19', texto: '¿Le han vendido propiedades sin su consentimiento?', categoria: 'Económico' },
  { id: 'p20', texto: '¿Le han presionado para dejar de ser dueño de su casa?', categoria: 'Económico' },

  // SEXUAL
  { id: 'p21', texto: '¿Le han exigido relaciones sexuales sin quererlo?', categoria: 'Sexual' },
  { id: 'p22', texto: '¿Le han tocado sin su consentimiento?', categoria: 'Sexual' },
];

const opcionesB = [
  { valor: '1', texto: 'Una vez' },
  { valor: '2', texto: 'Pocas veces' },
  { valor: '3', texto: 'Muchas veces' },
  { valor: '99', texto: 'No respondió' },
];

const opcionesC = [
  { valor: '1', texto: 'Un año o menos' },
  { valor: '98', texto: 'No recuerda' },
];

const opcionesE = [
  { valor: '1', texto: 'Hombre' },
  { valor: '2', texto: 'Mujer' },
];

const PantallaPruebaMaltrato = ({ navigation, route }: any) => {
  const { pacienteId } = route.params || {};
  const [respuestas, setRespuestas] = useState<{ [key: string]: Respuesta }>({});

  const setValor = (id: string, campo: keyof Respuesta, valor: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { A: '', B: '', C: '', D: '', E: '' }),
        [campo]: valor,
      },
    }));
  };

  const guardar = async() => {
    try{
    const incompletas = preguntas.filter((p) => !respuestas[p.id] || respuestas[p.id].A === '');
    if (incompletas.length > 0) {
      Alert.alert('Error', 'Debes responder la columna A de todas las preguntas.');
      return;
    }

    // Calcular puntaje: 1 punto por cada "Sí" en A
    let puntaje = 0;
    preguntas.forEach((p) => {
      const r = respuestas[p.id];
      if (r?.A === '1') {
        puntaje += 1;
      }
    });

    // Enviar a pantalla anterior (si aplica)
    if (navigation && navigation.navigate) {
      navigation.navigate('PantallaPruebas', { total: puntaje }); // o el nombre que uses
    }
    await guardarResultado(pacienteId, 'Maltrato', puntaje);
    await guardarPruebaFirebase(pacienteId, 'Maltrato', puntaje);
    Alert.alert('Evaluación completada', `Puntaje total: ${puntaje}`);
    console.log('Puntaje maltrato:', puntaje);
    console.log('Respuestas completas:', respuestas);
    } catch(error){
      console.error('Error al guardar el resultado:', error);
      Alert.alert('Error al guardar el resultado');
    }
  };

  const categorias = [...new Set(preguntas.map((p) => p.categoria))];

  return (
    <ScrollView style={styles.contenedor}>
      <Text style={styles.titulo}>Escala Geriátrica de Maltrato</Text>

      {categorias.map((cat) => (
        <View key={cat}>
          <Text style={styles.categoria}>{cat}</Text>
          {preguntas.filter((p) => p.categoria === cat).map((p) => {
            const r = respuestas[p.id] || { A: '', B: '', C: '', D: '', E: '' };
            return (
              <View key={p.id} style={styles.preguntaBloque}>
                <Text style={styles.pregunta}>{p.texto}</Text>

                <Text style={styles.columna}>A</Text>
                <View style={styles.fila}>
                  {['0', '1'].map((op) => (
                    <Pressable
                      key={op}
                      style={[styles.opcion, r.A === op && styles.seleccionado]}
                      onPress={() => setValor(p.id, 'A', op)}
                    >
                      <Text style={styles.opcionTexto}>{op === '0' ? 'No' : 'Sí'}</Text>
                    </Pressable>
                  ))}
                </View>

                {r.A === '1' && (
                  <>
                    <Text style={styles.columna}>B</Text>
                    <View style={styles.fila}>
                      {opcionesB.map(({ valor, texto }) => (
                        <Pressable
                          key={valor}
                          style={[styles.opcion, r.B === valor && styles.seleccionado]}
                          onPress={() => setValor(p.id, 'B', valor)}
                        >
                          <Text style={styles.opcionTexto}>{`${valor}. ${texto}`}</Text>
                        </Pressable>
                      ))}
                    </View>

                    <Text style={styles.columna}>C</Text>
                    <View style={styles.fila}>
                      {opcionesC.map(({ valor, texto }) => (
                        <Pressable
                          key={valor}
                          style={[styles.opcion, r.C === valor && styles.seleccionado]}
                          onPress={() => setValor(p.id, 'C', valor)}
                        >
                          <Text style={styles.opcionTexto}>{`${valor}. ${texto}`}</Text>
                        </Pressable>
                      ))}
                    </View>

                    <Text style={styles.columna}>D</Text>
                    <TextInput
                      placeholder="Escriba parentesco"
                      value={r.D}
                      onChangeText={(texto) => setValor(p.id, 'D', texto)}
                      style={styles.input}
                    />

                    <Text style={styles.columna}>E</Text>
                    <View style={styles.fila}>
                      {opcionesE.map(({ valor, texto }) => (
                        <Pressable
                          key={valor}
                          style={[styles.opcion, r.E === valor && styles.seleccionado]}
                          onPress={() => setValor(p.id, 'E', valor)}
                        >
                          <Text style={styles.opcionTexto}>{`${valor}. ${texto}`}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}
              </View>
            );
          })}
        </View>
      ))}

      <Pressable style={styles.botonGuardar} onPress={guardar}>
        <Text style={styles.botonTexto}>GUARDAR</Text>
      </Pressable>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: { padding: 20, backgroundColor: '#F8F8F8' },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  categoria: { fontSize: 18, fontWeight: 'bold', color: '#6D28D9', marginTop: 20, marginBottom: 10 },
  preguntaBloque: { marginBottom: 20 },
  pregunta: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  columna: { fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  opcion: { backgroundColor: '#DDD', padding: 10, borderRadius: 8 },
  seleccionado: { backgroundColor: '#6D28D9' },
  opcionTexto: { color: '#fff', fontWeight: 'bold' },
  input: { backgroundColor: '#EEE', padding: 10, borderRadius: 8, marginBottom: 10, color: '#333' },
  botonGuardar: { marginTop: 30, backgroundColor: '#6D28D9', padding: 15, borderRadius: 10, alignItems: 'center' },
  botonTexto: { color: '#fff', fontWeight: 'bold' },
  botonVolver: { marginTop: 10, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#6D28D9', alignItems: 'center' },
  botonTextoVolver: { color: '#6D28D9', fontWeight: 'bold' },
});

export default PantallaPruebaMaltrato;
