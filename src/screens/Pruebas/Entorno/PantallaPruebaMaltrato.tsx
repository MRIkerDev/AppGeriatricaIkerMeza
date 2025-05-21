import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { hayInternet } from '../../../utils/checarInternet';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
  icon: string;
};

const preguntas: Pregunta[] = [
  // FÍSICO
  { id: 'p1', texto: '¿Le han golpeado?', categoria: 'Físico', icon: 'fitness' },
  { id: 'p2', texto: '¿Le han dado puñetazos o patadas?', categoria: 'Físico', icon: 'fitness' },
  { id: 'p3', texto: '¿Le han empujado o le han jalado el pelo?', categoria: 'Físico', icon: 'fitness' },
  { id: 'p4', texto: '¿Le han aventado algún objeto?', categoria: 'Físico', icon: 'fitness' },
  { id: 'p5', texto: '¿Le han agredido con algún cuchillo o navaja?', categoria: 'Físico', icon: 'fitness' },

  // PSICOLÓGICO
  { id: 'p6', texto: '¿Le han humillado o se han burlado de usted?', categoria: 'Psicológico', icon: 'brain' },
  { id: 'p7', texto: '¿Le han tratado con indiferencia o le han ignorado?', categoria: 'Psicológico', icon: 'brain' },
  { id: 'p8', texto: '¿Le han aislado o le han corrido de la casa?', categoria: 'Psicológico', icon: 'brain' },
  { id: 'p9', texto: '¿Le han hecho sentir miedo?', categoria: 'Psicológico', icon: 'brain' },
  { id: 'p10', texto: '¿No han respetado sus decisiones?', categoria: 'Psicológico', icon: 'brain' },
  { id: 'p11', texto: '¿Le han prohibido salir o que lo visiten?', categoria: 'Psicológico', icon: 'brain' },

  // NEGLIGENCIA
  { id: 'p12', texto: '¿Le han dejado de proporcionar ropa, calzado, etc?', categoria: 'Negligencia', icon: 'alert-circle' },
  { id: 'p13', texto: '¿Le han dejado de suministrar medicamentos?', categoria: 'Negligencia', icon: 'alert-circle' },
  { id: 'p14', texto: '¿Le han negado protección cuando la necesita?', categoria: 'Negligencia', icon: 'alert-circle' },
  { id: 'p15', texto: '¿Le han negado acceso a la casa que habita?', categoria: 'Negligencia', icon: 'alert-circle' },

  // ECONÓMICO
  { id: 'p16', texto: '¿Alguien ha manejado su dinero sin su consentimiento?', categoria: 'Económico', icon: 'cash' },
  { id: 'p17', texto: '¿Le han quitado su dinero?', categoria: 'Económico', icon: 'cash' },
  { id: 'p18', texto: '¿Le han tomado bienes sin permiso?', categoria: 'Económico', icon: 'cash' },
  { id: 'p19', texto: '¿Le han vendido propiedades sin su consentimiento?', categoria: 'Económico', icon: 'cash' },
  { id: 'p20', texto: '¿Le han presionado para dejar de ser dueño de su casa?', categoria: 'Económico', icon: 'cash' },

  // SEXUAL
  { id: 'p21', texto: '¿Le han exigido relaciones sexuales sin quererlo?', categoria: 'Sexual', icon: 'warning' },
  { id: 'p22', texto: '¿Le han tocado sin su consentimiento?', categoria: 'Sexual', icon: 'warning' },
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
  const [guardando, setGuardando] = useState(false);
  const [, setPuntajeTotal] = useState<number | null>(null);

  const setValor = (id: string, campo: keyof Respuesta, valor: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { A: '', B: '', C: '', D: '', E: '' }),
        [campo]: valor,
      },
    }));
  };

  const calcularPuntaje = () => {
    const incompletas = preguntas.filter((p) => !respuestas[p.id] || respuestas[p.id].A === '');
    if (incompletas.length > 0) {
      Alert.alert('Campos incompletos', 'Debes responder la columna A de todas las preguntas.');
      return null;
    }

    // Calcular puntaje: 1 punto por cada "Sí" en A
    let puntaje = 0;
    preguntas.forEach((p) => {
      const r = respuestas[p.id];
      if (r?.A === '1') {
        puntaje += 1;
      }
    });

    return puntaje;
  };

  const guardar = async() => {
    try {
      const puntaje = calcularPuntaje();
      if (puntaje === null) {return;}

      setGuardando(true);
      setPuntajeTotal(puntaje);

      await guardarResultado(pacienteId, 'Maltrato', puntaje);

      const hayNet = await hayInternet();
      if (hayNet) {
        await guardarPruebaFirebase(pacienteId, 'Maltrato', puntaje);
      }

      setGuardando(false);

      Alert.alert(
        'Evaluación completada',
        `Puntaje total: ${puntaje}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('PantallaPruebas', { total: puntaje, pacienteId }),
          },
        ]
      );
    } catch(error) {
      console.error('Error al guardar el resultado:', error);
      Alert.alert('Error', 'No se pudo guardar el resultado. Inténtalo de nuevo.');
      setGuardando(false);
    }
  };

  const getColorPorCategoria = (categoria: string) => {
    switch (categoria) {
      case 'Físico': return '#E53935';
      case 'Psicológico': return '#7B1FA2';
      case 'Negligencia': return '#FF9800';
      case 'Económico': return '#2E7D32';
      case 'Sexual': return '#D32F2F';
      default: return '#4D96FF';
    }
  };

  const categorias = [...new Set(preguntas.map((p) => p.categoria))];

  const preguntasRespondidas = Object.keys(respuestas).filter(id => respuestas[id].A !== '').length;
  const progreso = (preguntasRespondidas / preguntas.length) * 100;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#0A2463" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escala Geriátrica de Maltrato</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Tarjeta de instrucciones */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={24} color="#ffffff" />
              <Text style={styles.cardTitle}>Instrucciones</Text>
            </View>
            <Text style={styles.cardText}>
              Esta escala evalúa diferentes tipos de maltrato en adultos mayores. Responda todas las preguntas de la columna A.
              Si la respuesta es "Sí", complete las columnas adicionales.
            </Text>
          </View>

          {/* Barra de progreso */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progreso}%` }]} />
            </View>
            <Text style={styles.progressText}>{`${preguntasRespondidas} de ${preguntas.length} preguntas respondidas`}</Text>
          </View>

          {categorias.map((cat) => (
            <View key={cat} style={styles.categoriaContainer}>
              <View style={[styles.categoriaHeader, { backgroundColor: getColorPorCategoria(cat) }]}>
                <Ionicons
                  name={preguntas.find(p => p.categoria === cat)?.icon || 'help-circle'}
                  size={24}
                  color="#ffffff"
                />
                <Text style={styles.categoriaTitle}>{cat}</Text>
              </View>

              {preguntas.filter((p) => p.categoria === cat).map((p) => {
                const r = respuestas[p.id] || { A: '', B: '', C: '', D: '', E: '' };
                return (
                  <View key={p.id} style={styles.preguntaCard}>
                    <Text style={styles.pregunta}>{p.texto}</Text>

                    <View style={styles.seccionRespuesta}>
                      <Text style={styles.columnaLabel}>A. ¿Ha ocurrido?</Text>
                      <View style={styles.opcionesRow}>
                        <TouchableOpacity
                          style={[styles.opcionButton, r.A === '0' && styles.opcionSelected]}
                          onPress={() => setValor(p.id, 'A', '0')}
                        >
                          <Text style={[styles.opcionText, r.A === '0' && styles.opcionTextSelected]}>No</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.opcionButton, r.A === '1' && styles.opcionSelected]}
                          onPress={() => setValor(p.id, 'A', '1')}
                        >
                          <Text style={[styles.opcionText, r.A === '1' && styles.opcionTextSelected]}>Sí</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {r.A === '1' && (
                      <>
                        <View style={styles.seccionRespuesta}>
                          <Text style={styles.columnaLabel}>B. ¿Con qué frecuencia?</Text>
                          <View style={styles.opcionesColumn}>
                            {opcionesB.map(({ valor, texto }) => (
                              <TouchableOpacity
                                key={valor}
                                style={[styles.opcionButton, r.B === valor && styles.opcionSelected]}
                                onPress={() => setValor(p.id, 'B', valor)}
                              >
                                <Text style={[styles.opcionText, r.B === valor && styles.opcionTextSelected]}>
                                  {texto}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>

                        <View style={styles.seccionRespuesta}>
                          <Text style={styles.columnaLabel}>C. ¿Desde cuándo?</Text>
                          <View style={styles.opcionesColumn}>
                            {opcionesC.map(({ valor, texto }) => (
                              <TouchableOpacity
                                key={valor}
                                style={[styles.opcionButton, r.C === valor && styles.opcionSelected]}
                                onPress={() => setValor(p.id, 'C', valor)}
                              >
                                <Text style={[styles.opcionText, r.C === valor && styles.opcionTextSelected]}>
                                  {texto}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>

                        <View style={styles.seccionRespuesta}>
                          <Text style={styles.columnaLabel}>D. ¿Quién fue? (Parentesco)</Text>
                          <TextInput
                            placeholder="Escriba el parentesco"
                            value={r.D}
                            onChangeText={(texto) => setValor(p.id, 'D', texto)}
                            style={styles.input}
                          />
                        </View>

                        <View style={styles.seccionRespuesta}>
                          <Text style={styles.columnaLabel}>E. ¿Sexo de quien maltrató?</Text>
                          <View style={styles.opcionesRow}>
                            {opcionesE.map(({ valor, texto }) => (
                              <TouchableOpacity
                                key={valor}
                                style={[styles.opcionButton, r.E === valor && styles.opcionSelected]}
                                onPress={() => setValor(p.id, 'E', valor)}
                              >
                                <Text style={[styles.opcionText, r.E === valor && styles.opcionTextSelected]}>
                                  {texto}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          {/* Botones de acción */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={guardar}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Ionicons name="save" size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Guardar Resultado</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Botón de regresar en la parte inferior */}
          <TouchableOpacity
            style={styles.bottomBackButton}
            onPress={() => navigation.navigate('PantallaPruebas', { pacienteId })}
          >
            <Ionicons name="arrow-back-circle" size={20} color="#666666" />
            <Text style={styles.bottomBackButtonText}>Volver a Pruebas</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0A2463',
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#4D96FF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#333333',
    padding: 16,
    paddingTop: 12,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4D96FF',
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#666666',
    fontSize: 14,
  },
  categoriaContainer: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  categoriaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#4D96FF',
  },
  categoriaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  preguntaCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pregunta: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  seccionRespuesta: {
    marginBottom: 12,
  },
  columnaLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0A2463',
    marginBottom: 8,
  },
  opcionesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  opcionesColumn: {
    flexDirection: 'column',
    gap: 8,
  },
  opcionButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 100,
    alignItems: 'center',
  },
  opcionSelected: {
    backgroundColor: '#4D96FF',
    borderColor: '#0A2463',
  },
  opcionText: {
    color: '#333333',
    fontWeight: '500',
  },
  opcionTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f9f9f9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  actionButtonsContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4D96FF',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  actionButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  bottomBackButtonText: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 8,
  },
});

export default PantallaPruebaMaltrato;
