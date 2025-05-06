import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Button, Alert, ScrollView } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';


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
const PantallaPruebaOARS = ({ navigation }: any) => {
  const [answers, setAnswers] = useState<any>({});
  const [resultado, setResultado] = useState('');

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

  // eslint-disable-next-line react/no-unstable-nested-components
  const RadioButton = ({ selected, onPress, label, disabled = false }: { selected: boolean, onPress: () => void, label: string, disabled?: boolean }) => (
    <TouchableOpacity
      style={[styles.option, disabled && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={[styles.radioCircle, selected && styles.radioSelected]} />
      <Text>{label}</Text>
    </TouchableOpacity>
  );

  const guardarRespuestas = () => {
    const camposObligatorios = [
      'convivencia',
      'contactos',
      'telefono',
      'confianza',
      'cuantasPersonas',
      'visitas',
    ];

    if (answers.tieneAyuda === 'si') {camposObligatorios.push('tipoCuidado');}

    for (let campo of camposObligatorios) {
      if (!answers[campo] || answers[campo].toString().trim() === '') {
        Alert.alert('Faltan respuestas', 'Por favor, responde todas las preguntas importantes antes de guardar.');
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

    const resultadoTexto = evaluarRecursosSociales(answers);
    setResultado(resultadoTexto);
    Alert.alert('Respuestas guardadas');

   navigation.navigate('PantallaPruebas', { total: resultadoTexto });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
          <ScrollView>
          <Text style={styles.title}>
  Cuestionario OARS{'\n'}Recursos Sociales{'\n'}
</Text>
          <View style={styles.questionContainer}>
            <Text style={styles.question}>1. ¿Su estado civil es?</Text>
            <RadioButton selected={answers.estadoCivil === 'soltero'} onPress={() => handleSelect('estadoCivil', 'soltero')} label="Soltero (a)" />
            <RadioButton selected={answers.estadoCivil === 'casado'} onPress={() => handleSelect('estadoCivil', 'casado')} label="Casado (a) o Unión Libre" />
            <RadioButton selected={answers.estadoCivil === 'viudo'} onPress={() => handleSelect('estadoCivil', 'viudo')} label="Viudo (a)" />
            <RadioButton selected={answers.estadoCivil === 'divorciado'} onPress={() => handleSelect('estadoCivil', 'divorciado')} label="Divorciado (a)" />
            <RadioButton selected={answers.estadoCivil === 'separado'} onPress={() => handleSelect('estadoCivil', 'separado')} label="Separado (a)" />
          </View>

        <View style={styles.questionContainer}>
  <Text style={styles.question}>2. ¿Vive su esposo(a)?</Text>
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

      <View style={styles.questionContainer}>
  <Text style={styles.question}>3. ¿Con quién vive usted?</Text>
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
    style={styles.input}
    placeholder="Otros (especifique)"
    onChangeText={text => handleSelect('viveCon_Otros', text)}
    value={answers.viveCon_Otros || ''}
    editable={!answers.viveCon_Nadie}
  />
</View>

{/*EVALUA 5555555555555555*/}
         <View style={styles.questionContainer}>
  <Text style={styles.question}>4. ¿Con cuántas personas vive?</Text>
  {['1–2', '2–3', '4 o más'].map((item, index) => (
    <RadioButton
      key={index}
      selected={answers.cuantasPersonas === item}
      onPress={() => handleSelect('cuantasPersonas', item)}
      label={item}
    />
  ))}
</View>


          <View style={styles.questionContainer}>
            <Text style={styles.question}>5. En el último año, ¿cuántas veces visitó a su familia, amigos, durante fines de semana, vacaciones, compras o excursiones?</Text>
            {['Nunca', 'Cada seis meses', 'Cada tres meses', 'Cada mes', 'Menos de una vez al mes o sólo en vacaciones', 'Menos de una vez a la semana', '1–3 veces a la semana', 'Más de cuatro veces a la semana'].map((item, index) => (
              <RadioButton key={index} selected={answers.visitas === item} onPress={() => handleSelect('visitas', item)} label={item} />
            ))}
          </View>
{/*EVALUA 22222222222222222222222222222222*/}
          <View style={styles.questionContainer}>
            <Text style={styles.question}>6. ¿A cuántas personas conoce lo suficientemente bien como para visitarles en casa?</Text>
            {['Ninguna', 'Una o dos', 'De tres a cuatro', 'Cinco o más'].map((item, index) => (
              <RadioButton key={index} selected={answers.contactos === item} onPress={() => handleSelect('contactos', item)} label={item} />
            ))}
          </View>
{/*EVALUA 333333333333333333333333333333333333333*/}
          <View style={styles.questionContainer}>
            <Text style={styles.question}>7. En la última semana, ¿cuántas veces habló por teléfono con amigos o familiares?</Text>
            {['Ninguna vez', 'Una vez a la semana', 'Dos a seis veces a la semana', 'Más de seis veces a la semana', 'Una vez al día'].map((item, index) => (
              <RadioButton key={index} selected={answers.telefono === item} onPress={() => handleSelect('telefono', item)} label={item} />
            ))}
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.question}>8. ¿Cuántas veces en la última semana pasó tiempo con alguien que no vive con usted?</Text>
            {['Ninguna vez', 'Una vez', '2 – 6 veces al día', 'Más de seis veces al día'].map((item, index) => (
              <RadioButton key={index} selected={answers.visitasSemana === item} onPress={() => handleSelect('visitasSemana', item)} label={item} />
            ))}
          </View>
{/*EVALUA 4444444444444444444444*/}
          <View style={styles.questionContainer}>
            <Text style={styles.question}>9. ¿Tiene alguien en quién confiar?</Text>
            <RadioButton selected={answers.confianza === 'no'} onPress={() => handleSelect('confianza', 'no')} label="No" />
<RadioButton selected={answers.confianza === 'si'} onPress={() => handleSelect('confianza', 'si')} label="Sí" />
<TextInput
  style={styles.input}
  placeholder="Especifique"
  onChangeText={text => handleSelect('confianzaEspecifica', text)}
  value={answers.confianzaEspecifica || ''}
  editable={answers.confianza === 'si'}
/>
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.question}>10. ¿Se encuentra solo(a) o se siente en soledad a menudo?</Text>
            {['Casi nunca', 'Algunas veces', 'A menudo'].map((item, index) => (
              <RadioButton key={index} selected={answers.soledad === item} onPress={() => handleSelect('soledad', item)} label={item} />
            ))}
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.question}>11. ¿Ve a sus familiares y amigos a menudo como quisiera?</Text>
            {['Algo triste por la poca frecuencia', 'Tan a menudo como quisiera'].map((item, index) => (
              <RadioButton key={index} selected={answers.frecuenciaVisitas === item} onPress={() => handleSelect('frecuenciaVisitas', item)} label={item} />
            ))}
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.question}>12. Si alguna vez necesitase ayuda, ¿tendría quién le prestase ayuda?</Text>
            <RadioButton selected={answers.tieneAyuda === 'no'} onPress={() => handleSelect('tieneAyuda', 'no')} label="No" />
            <RadioButton selected={answers.tieneAyuda === 'si'} onPress={() => handleSelect('tieneAyuda', 'si')} label="Sí" />
          </View>
{/*EVALUA 666666666666666666*/}
       <View style={styles.questionContainer}>
  <Text style={styles.question}>A.- ¿Esa persona cuidaría de usted?</Text>
  {['Sólo de forma pasajera', 'Durante un corto periodo', 'De forma indefinida'].map((item, index) => (
    <RadioButton
      key={index}
      selected={answers.tipoCuidado === item}
      onPress={() => handleSelect('tipoCuidado', item)}
      label={item}
      disabled={answers.tieneAyuda === 'no'}
    />
  ))}

  <Text style={styles.question}>B.- ¿Quién sería esa persona?</Text>
  <TextInput
    style={styles.input}
    placeholder="Nombre"
    onChangeText={text => handleSelect('nombreCuidador', text)}
    value={answers.nombreCuidador || ''}
    editable={answers.tieneAyuda !== 'no'}
  />
  <TextInput
    style={styles.input}
    placeholder="Relación"
    onChangeText={text => handleSelect('relacionCuidador', text)}
    value={answers.relacionCuidador || ''}
    editable={answers.tieneAyuda !== 'no'}
  />
</View>

{/*EVALUA 1111111111111111111111111111111111111111111111*/}
          <View style={styles.questionContainer}>
            <Text style={styles.question}>13. ¿Cómo considera la convivencia y apoyo de familiares y amigos?</Text>
            {['Muy insatisfactoria', 'Insatisfactoria', 'Muy satisfactoria', 'Satisfactoria'].map((item, index) => (
              <RadioButton key={index} selected={answers.convivencia === item} onPress={() => handleSelect('convivencia', item)} label={item} />
            ))}
          </View>

          {/* Botón de guardado */}
          <Button title="Guardar Respuestas" onPress={guardarRespuestas} />

          {resultado !== '' && (
            <View style={styles.resultadoContainer}>
              <Text style={styles.resultadoTexto}>{resultado}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f2ff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
    textAlign: 'center',
    marginBottom: 20,
  },
  questionContainer: {
  marginBottom: 20,
},

  question: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#333',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#0077b6',
    marginRight: 10,
  },
  radioSelected: {
    backgroundColor: '#0077b6',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#f2f2f2',
    fontSize: 15,
    marginTop: 8,
  },
  resultadoContainer: {
    backgroundColor: '#d0f0c0',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  resultadoTexto: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});


export default PantallaPruebaOARS;
