import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { hayInternet } from '../../../utils/checarInternet';
import Ionicons from 'react-native-vector-icons/Ionicons';

const evaluarRecursosSociales = (answers: { convivencia?: any; contactos?: any; telefono?: any; confianza?: any; cuantasPersonas?: any; visitas?: any; tipoCuidado?: any; }) => {
  const convivencia = answers.convivencia?.toLowerCase() || '';
  const contactos = answers.contactos || '';
  const telefono = answers.telefono || '';
  const confianza = answers.confianza || '';
  const cuantas = answers.cuantasPersonas || '';
  const visitas = answers.visitas || '';
  const tipoCuidado = answers.tipoCuidado || '';

  const tieneConvivenciaBuena = convivencia.includes('satisfactoria');
  const conoceCincoOMas = contactos === 'Cinco o más';
  const conoceTresACuatro = contactos === 'De tres a cuatro';
  const conoceUnaODos = contactos === 'Una o dos';
  const noConoce = contactos === 'Ninguna';

  const telefonoFrecuente = telefono === 'Una vez al día' || telefono === 'Más de seis veces a la semana';
  const telefonoRegular = telefono === 'Dos a seis veces a la semana' || telefono === 'Una vez a la semana';
  const telefonoPoco = telefono === 'Ninguna vez';

  const tieneApoyoIndefinido = tipoCuidado === 'De forma indefinida';
  const tieneApoyoCorto = tipoCuidado === 'Durante un corto periodo' || tipoCuidado === 'Sólo de forma pasajera';

  const visitasFrecuentes = visitas === '1–3 veces a la semana' || visitas === 'Más de cuatro veces a la semana';
  const visitasMedias = visitas === 'Menos de una vez a la semana' || visitas === 'Cada mes';
  const visitasBajas = visitas === 'Cada tres meses' || visitas === 'Cada seis meses' || visitas === 'Nunca';

  const viveCon2oMas = cuantas === '2–3' || cuantas === '4 o más';
  const viveCon3oMas = cuantas === '2–3' || cuantas === '4 o más';
  const viveCon4oMas = cuantas === '4 o más';
  const viveCon1 = cuantas === '1–2';

  if (
    tieneConvivenciaBuena &&
    conoceCincoOMas &&
    telefonoFrecuente &&
    confianza === 'si' &&
    viveCon4oMas &&
    visitasFrecuentes &&
    tieneApoyoIndefinido
  ) {
    return '1. Excelentes recursos sociales.';
  }

  if (
    tieneConvivenciaBuena &&
    (conoceTresACuatro || conoceCincoOMas) &&
    telefonoRegular &&
    confianza === 'si' &&
    viveCon3oMas &&
    visitasFrecuentes &&
    (tieneApoyoIndefinido || tieneApoyoCorto)
  ) {
    return '2. Buenos recursos sociales.';
  }

  if (
    !tieneConvivenciaBuena &&
    conoceUnaODos &&
    telefonoRegular &&
    confianza === 'si' &&
    viveCon2oMas &&
    visitasMedias &&
    (tieneApoyoIndefinido || tieneApoyoCorto)
  ) {
    return '3. Recursos sociales ligeramente deteriorados.';
  }

  if (
    !tieneConvivenciaBuena &&
    conoceUnaODos &&
    telefonoRegular &&
    confianza === 'si' &&
    viveCon2oMas &&
    visitasBajas &&
    tieneApoyoCorto
  ) {
    return '4. Recursos sociales moderadamente deteriorados.';
  }

  if (
    !tieneConvivenciaBuena &&
    (noConoce || telefonoPoco || confianza !== 'si') &&
    viveCon1 &&
    visitasBajas &&
    tieneApoyoCorto
  ) {
    return '5. Recursos sociales bastante deteriorados.';
  }

  return '6. Recursos sociales totalmente deteriorados.';
};

const PantallaPruebaOARS = ({ navigation, route }: any) => {
  const { pacienteId } = route.params || {};
  const [answers, setAnswers] = useState<any>({});
  const [resultado, setResultado] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleSelect = (question: string, value: any) => {
    setAnswers((prev: any) => {
      const newAnswers = { ...prev, [question]: value };

      if (question === 'viveEsposo') {
        newAnswers['viveCon_Esposo (a)'] = value === 'si';
      }

      if (question === 'viveCon_Nadie' && value === true) {
        // Si elige "Nadie", desactiva los demás "viveCon_*"
        const updated = Object.fromEntries(
          Object.entries(newAnswers).map(([k, v]) =>
            k.startsWith('viveCon_') && k !== 'viveCon_Nadie' ? [k, false] : [k, v]
          )
        );
        return updated;
      }

      return newAnswers;
    });
  };

  const RadioButton = ({ selected, onPress, label, disabled = false }: { selected: boolean, onPress: () => void, label: string, disabled?: boolean }) => (
    <TouchableOpacity
      style={[styles.radioOption, disabled && styles.radioOptionDisabled, selected && styles.radioOptionSelected]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={[styles.radioCircle, selected && styles.radioCircleSelected]} />
      <Text style={[styles.radioLabel, selected && styles.radioLabelSelected, disabled && styles.radioLabelDisabled]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const getResultadoColor = () => {
    if (!resultado) {return '#4D96FF';}

    const nivel = parseInt(resultado.charAt(0));
    if (nivel <= 2) {return '#4CAF50';} // Verde para buenos recursos
    if (nivel <= 4) {return '#FFC107';} // Amarillo para recursos moderados
    return '#F44336'; // Rojo para recursos deteriorados
  };

  const getResultadoIcon = () => {
    if (!resultado) {return 'help-circle';}

    const nivel = parseInt(resultado.charAt(0));
    if (nivel <= 2) {return 'checkmark-circle';}
    if (nivel <= 4) {return 'alert-circle';}
    return 'warning';
  };

  const guardarRespuestas = async () => {
    try {
      const camposObligatorios = [
        'convivencia',
        'contactos',
        'telefono',
        'confianza',
        'cuantasPersonas',
        'visitas',
      ];

      if (answers.tieneAyuda === 'si') {
        camposObligatorios.push('tipoCuidado');
      }

      for (let campo of camposObligatorios) {
        if (!answers[campo] || answers[campo].toString().trim() === '') {
          Alert.alert('Campos incompletos', 'Por favor, responde todas las preguntas importantes antes de guardar.');
          return;
        }
      }

      if (answers.confianza === 'si' && (!answers.confianzaEspecifica?.trim())) {
        Alert.alert('Falta especificar', 'Por favor, indica en quién confías.');
        return;
      }

      if (answers.tieneAyuda === 'si') {
        if (!answers.nombreCuidador?.trim()) {
          Alert.alert('Falta nombre', 'Por favor, escribe el nombre del cuidador.');
          return;
        }
        if (!answers.relacionCuidador?.trim()) {
          Alert.alert('Falta relación', 'Por favor, indica la relación con el cuidador.');
          return;
        }
      }

      setGuardando(true);
      const resultadoTexto = evaluarRecursosSociales(answers);
      setResultado(resultadoTexto);

      const puntaje = parseInt(resultadoTexto.charAt(0));

      await guardarResultado(pacienteId, 'OARS', puntaje);

      const hayNet = await hayInternet();
      if (hayNet) {
        await guardarPruebaFirebase(pacienteId, 'OARS', puntaje);
      }

      setGuardando(false);

      Alert.alert(
        'Evaluación completada',
        `${resultadoTexto}`,
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

  // Calcular progreso
  const totalPreguntas = 13;
  const preguntasRespondidas = Object.keys(answers).filter(key =>
    !key.startsWith('viveCon_') &&
    !['confianzaEspecifica', 'nombreCuidador', 'relacionCuidador'].includes(key) &&
    answers[key] !== ''
  ).length;

  const progreso = (preguntasRespondidas / totalPreguntas) * 100;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#0A2463" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cuestionario OARS</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Tarjeta de instrucciones */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={24} color="#ffffff" />
              <Text style={styles.cardTitle}>Recursos Sociales</Text>
            </View>
            <Text style={styles.cardText}>
              Este cuestionario evalúa los recursos sociales del adulto mayor. Responda todas las preguntas para obtener una evaluación precisa.
            </Text>
          </View>

          {/* Barra de progreso */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progreso}%` }]} />
            </View>
            <Text style={styles.progressText}>{`${preguntasRespondidas} de ${totalPreguntas} preguntas respondidas`}</Text>
          </View>

          {/* Pregunta 1 */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Ionicons name="person" size={20} color="#0A2463" />
              <Text style={styles.questionNumber}>1</Text>
              <Text style={styles.questionText}>¿Su estado civil es?</Text>
            </View>
            <View style={styles.optionsContainer}>
              {['soltero', 'casado', 'viudo', 'divorciado', 'separado'].map((value, index) => (
                <RadioButton
                  key={index}
                  selected={answers.estadoCivil === value}
                  onPress={() => handleSelect('estadoCivil', value)}
                  label={value === 'soltero' ? 'Soltero (a)' :
                         value === 'casado' ? 'Casado (a) o Unión Libre' :
                         value === 'viudo' ? 'Viudo (a)' :
                         value === 'divorciado' ? 'Divorciado (a)' : 'Separado (a)'}
                />
              ))}
            </View>
          </View>

          {/* Pregunta 2 */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Ionicons name="people" size={20} color="#0A2463" />
              <Text style={styles.questionNumber}>2</Text>
              <Text style={styles.questionText}>¿Vive su esposo(a)?</Text>
            </View>
            <View style={styles.optionsContainer}>
              <RadioButton
                selected={answers.viveEsposo === 'no'}
                onPress={() => handleSelect('viveEsposo', 'no')}
                label="No"
                disabled={answers.estadoCivil !== 'casado'}
              />
              <RadioButton
                selected={answers.viveEsposo === 'si'}
                onPress={() => handleSelect('viveEsposo', 'si')}
                label="Sí"
                disabled={answers.estadoCivil !== 'casado'}
              />
            </View>
            {answers.estadoCivil !== 'casado' && (
              <Text style={styles.disabledNote}>Esta pregunta solo aplica si está casado(a)</Text>
            )}
          </View>

          {/* Pregunta 3 */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Ionicons name="home" size={20} color="#0A2463" />
              <Text style={styles.questionNumber}>3</Text>
              <Text style={styles.questionText}>¿Con quién vive usted?</Text>
            </View>
            <View style={styles.optionsContainer}>
              {['Nadie', 'Esposo (a)', 'Hijos (as)', 'Nietos (as)', 'Padres', 'Hermanos (as)', 'Otros familiares políticos', 'Amigos (as)', 'Cuidadores pagados'].map(item => {
                const key = `viveCon_${item}`;
                const isNadie = answers.viveCon_Nadie;
                const isDisabled = item !== 'Nadie' && isNadie;
                return (
                  <RadioButton
                    key={item}
                    selected={!!answers[key]}
                    onPress={() => handleSelect(key, !answers[key])}
                    label={item}
                    disabled={isDisabled}
                  />
                );
              })}
              <TextInput
                style={[styles.input, answers.viveCon_Nadie && styles.inputDisabled]}
                placeholder="Otros (especifique)"
                onChangeText={text => handleSelect('viveCon_Otros', text)}
                value={answers.viveCon_Otros || ''}
                editable={!answers.viveCon_Nadie}
              />
            </View>
          </View>

          {/* Pregunta 4 */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Ionicons name="people-circle" size={20} color="#0A2463" />
              <Text style={styles.questionNumber}>4</Text>
              <Text style={styles.questionText}>¿Con cuántas personas vive?</Text>
            </View>
            <View style={styles.optionsContainer}>
              {['1–2', '2–3', '4 o más'].map((item, index) => (
                <RadioButton
                  key={index}
                  selected={answers.cuantasPersonas === item}
                  onPress={() => handleSelect('cuantasPersonas', item)}
                  label={item}
                />
              ))}
            </View>
          </View>

          {/* Pregunta 5 */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Ionicons name="calendar" size={20} color="#0A2463" />
              <Text style={styles.questionNumber}>5</Text>
              <Text style={styles.questionText}>En el último año, ¿cuántas veces visitó a su familia, amigos, durante fines de semana, vacaciones, compras o excursiones?</Text>
            </View>
            <View style={styles.optionsContainer}>
              {['Nunca', 'Cada seis meses', 'Cada tres meses', 'Cada mes', 'Menos de una vez al mes o sólo en vacaciones', 'Menos de una vez a la semana', '1–3 veces a la semana', 'Más de cuatro veces a la semana'].map((item, index) => (
                <RadioButton key={index} selected={answers.visitas === item} onPress={() => handleSelect('visitas', item)} label={item} />
              ))}
            </View>
          </View>

          {/* Pregunta 6 */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Ionicons name="people" size={20} color="#0A2463" />
              <Text style={styles.questionNumber}>6</Text>
              <Text style={styles.questionText}>¿A cuántas personas conoce lo suficientemente bien como para visitarles en casa?</Text>
            </View>
            <View style={styles.optionsContainer}>
              {['Ninguna', 'Una o dos', 'De tres a cuatro', 'Cinco o más'].map((item, index) => (
                <RadioButton key={index} selected={answers.contactos === item} onPress={() => handleSelect('contactos', item)} label={item} />
              ))}
            </View>
          </View>

          {/* Pregunta 7 */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Ionicons name="call" size={20} color="#0A2463" />
              <Text style={styles.questionNumber}>7</Text>
              <Text style={styles.questionText}>En la última semana, ¿cuántas veces habló por teléfono con amigos o familiares?</Text>
            </View>
            <View style={styles.optionsContainer}>
              {['Ninguna vez', 'Una vez a la semana', 'Dos a seis veces a la semana', 'Más de seis veces a la semana', 'Una vez al día'].map((item, index) => (
                <RadioButton key={index} selected={answers.telefono === item} onPress={() => handleSelect('telefono', item)} label={item} />
              ))}
            </View>
          </View>

          {/* Pregunta 8 */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Ionicons name="time" size={20} color="#0A2463" />
              <Text style={styles.questionNumber}>8</Text>
              <Text style={styles.questionText}>¿Cuántas veces en la última semana pasó tiempo con alguien que no vive con usted?</Text>
            </View>
            <View style={styles.optionsContainer}>
              {['Ninguna vez', 'Una vez', '2 – 6 veces al día', 'Más de seis veces al día'].map((item, index) => (
                <RadioButton key={index} selected={answers.visitasSemana === item} onPress={() => handleSelect('visitasSemana', item)} label={item} />
              ))}
            </View>
          </View>

          {/* Pregunta 9 */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Ionicons name="heart" size={20} color="#0A2463" />
              <Text style={styles.questionNumber}>9</Text>
              <Text style={styles.questionText}>¿Tiene alguien en quién confiar?</Text>
            </View>
            <View style={styles.optionsContainer}>
              <RadioButton selected={answers.confianza === 'no'} onPress={() => handleSelect('confianza', 'no')} label="No" />
              <RadioButton selected={answers.confianza === 'si'} onPress={() => handleSelect('confianza', 'si')} label="Sí" />
              {answers.confianza === 'si' && (
                <TextInput
                  style={styles.input}
                  placeholder="Especifique en quién confía"
                  onChangeText={text => handleSelect('confianzaEspecifica', text)}
                  value={answers.confianzaEspecifica || ''}
                />
              )}
            </View>
          </View>

          {/* Pregunta 10 */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Ionicons name="sad" size={20} color="#0A2463" />
              <Text style={styles.questionNumber}>10</Text>
              <Text style={styles.questionText}>¿Se encuentra solo(a) o se siente en soledad a menudo?</Text>
            </View>
            <View style={styles.optionsContainer}>
              {['Casi nunca', 'Algunas veces', 'A menudo'].map((item, index) => (
                <RadioButton key={index} selected={answers.soledad === item} onPress={() => handleSelect('soledad', item)} label={item} />
              ))}
            </View>
          </View>

          {/* Pregunta 11 */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Ionicons name="happy" size={20} color="#0A2463" />
              <Text style={styles.questionNumber}>11</Text>
              <Text style={styles.questionText}>¿Ve a sus familiares y amigos a menudo como quisiera?</Text>
            </View>
            <View style={styles.optionsContainer}>
              {['Algo triste por la poca frecuencia', 'Tan a menudo como quisiera'].map((item, index) => (
                <RadioButton key={index} selected={answers.frecuenciaVisitas === item} onPress={() => handleSelect('frecuenciaVisitas', item)} label={item} />
              ))}
            </View>
          </View>

          {/* Pregunta 12 */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Ionicons name="help-buoy" size={20} color="#0A2463" />
              <Text style={styles.questionNumber}>12</Text>
              <Text style={styles.questionText}>Si alguna vez necesitase ayuda, ¿tendría quién le prestase ayuda?</Text>
            </View>
            <View style={styles.optionsContainer}>
              <RadioButton selected={answers.tieneAyuda === 'no'} onPress={() => handleSelect('tieneAyuda', 'no')} label="No" />
              <RadioButton selected={answers.tieneAyuda === 'si'} onPress={() => handleSelect('tieneAyuda', 'si')} label="Sí" />
            </View>
          </View>

          {/* Pregunta 12 - Subpreguntas */}
          {answers.tieneAyuda === 'si' && (
            <View style={styles.subQuestionCard}>
              <View style={styles.questionHeader}>
                <Ionicons name="help-buoy" size={20} color="#0A2463" />
                <Text style={styles.questionText}>A.- ¿Esa persona cuidaría de usted?</Text>
              </View>
              <View style={styles.optionsContainer}>
                {['Sólo de forma pasajera', 'Durante un corto periodo', 'De forma indefinida'].map((item, index) => (
                  <RadioButton
                    key={index}
                    selected={answers.tipoCuidado === item}
                    onPress={() => handleSelect('tipoCuidado', item)}
                    label={item}
                  />
                ))}
              </View>

              <View style={styles.questionHeader}>
                <Ionicons name="person" size={20} color="#0A2463" />
                <Text style={styles.questionText}>B.- ¿Quién sería esa persona?</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                onChangeText={text => handleSelect('nombreCuidador', text)}
                value={answers.nombreCuidador || ''}
              />
              <TextInput
                style={styles.input}
                placeholder="Relación"
                onChangeText={text => handleSelect('relacionCuidador', text)}
                value={answers.relacionCuidador || ''}
              />
            </View>
          )}

          {/* Pregunta 13 */}
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Ionicons name="thumbs-up" size={20} color="#0A2463" />
              <Text style={styles.questionNumber}>13</Text>
              <Text style={styles.questionText}>¿Cómo considera la convivencia y apoyo de familiares y amigos?</Text>
            </View>
            <View style={styles.optionsContainer}>
              {['Muy insatisfactoria', 'Insatisfactoria', 'Satisfactoria', 'Muy satisfactoria'].map((item, index) => (
                <RadioButton key={index} selected={answers.convivencia === item} onPress={() => handleSelect('convivencia', item)} label={item} />
              ))}
            </View>
          </View>

          {/* Botones de acción */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={guardarRespuestas}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Ionicons name="save" size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Guardar Respuestas</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Resultado */}
          {resultado !== '' && (
            <View style={[styles.resultCard, { borderColor: getResultadoColor() }]}>
              <View style={[styles.resultHeader, { backgroundColor: getResultadoColor() }]}>
                <Ionicons name={getResultadoIcon()} size={24} color="#ffffff" />
                <Text style={styles.resultTitle}>Resultado</Text>
              </View>
              <Text style={styles.resultText}>{resultado}</Text>
            </View>
          )}

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
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
  },
  subQuestionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A2463',
    marginLeft: 8,
    marginRight: 8,
  },
  questionText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    flexWrap: 'wrap',
  },
  optionsContainer: {
    marginLeft: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  radioOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4D96FF',
  },
  radioOptionDisabled: {
    opacity: 0.5,
    backgroundColor: '#f0f0f0',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4D96FF',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    backgroundColor: '#4D96FF',
    borderWidth: 6,
    borderColor: '#ffffff',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333333',
  },
  radioLabelSelected: {
    color: '#0A2463',
    fontWeight: '500',
  },
  radioLabelDisabled: {
    color: '#999999',
  },
  disabledNote: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
    marginTop: 8,
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#999999',
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
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    overflow: 'hidden',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#4D96FF',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    padding: 16,
    textAlign: 'center',
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

export default PantallaPruebaOARS;
