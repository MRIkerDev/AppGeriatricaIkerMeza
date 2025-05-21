import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Alert, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { guardarResultado } from '../../../database/database';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { hayInternet } from '../../../utils/checarInternet';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PantallaPruebaSARCF = ({ navigation, route }: any) => {
  const { pacienteId } = route.params || {};
  const [strength, setStrength] = useState('');
  const [assistance, setAssistance] = useState('');
  const [riseFromChair, setRiseFromChair] = useState('');
  const [climbStairs, setClimbStairs] = useState('');
  const [falls, setFalls] = useState('');
  const [totalScore, setTotalScore] = useState(0);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const calculateScore = async() => {
    try {
      const scores = [strength, assistance, riseFromChair, climbStairs, falls].map((val) => parseInt(val) || 0);
      const sum = scores.reduce((acc, num) => acc + num, 0);
      setTotalScore(sum);
      setMostrarResultado(true);
    } catch(error) {
      console.error('Error al calcular el resultado:', error);
      Alert.alert('Error al calcular el resultado');
    }
  };

  const guardarYNavegar = async() => {
    try {
      setGuardando(true);
      const result = totalScore >= 4 ? 'Alta probabilidad de sarcopenia' : 'Baja probabilidad de sarcopenia';

      await guardarResultado(pacienteId, 'SARCF', totalScore);
      const hayNet = await hayInternet();
      if (hayNet) {
        await guardarPruebaFirebase(pacienteId, 'SARCF', totalScore);
      }

      setGuardando(false);
      Alert.alert('Resultado', `Puntaje total: ${totalScore}\nInterpretación: ${result}`, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('PantallaPruebas', { total: totalScore, pacienteId: pacienteId }),
        },
      ]);
    } catch(error) {
      console.error('Error al guardar el resultado:', error);
      Alert.alert('Error al guardar el resultado');
      setGuardando(false);
    }
  };

  const getColorPorPuntaje = () => {
    if (totalScore < 4) {return '#4CAF50';} // Verde para baja probabilidad
    return '#F44336'; // Rojo para alta probabilidad
  };

  const getIconoPorPuntaje = () => {
    if (totalScore < 4) {return 'checkmark-circle';}
    return 'warning';
  };

  const getInterpretacion = () => {
    if (totalScore < 4) {return 'Baja probabilidad de sarcopenia';}
    return 'Alta probabilidad de sarcopenia';
  };

  const allFieldsFilled = () => {
    return strength !== '' && assistance !== '' && riseFromChair !== '' && climbStairs !== '' && falls !== '';
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#0A2463" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cuestionario SARC-F</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Tarjeta de instrucciones */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={24} color="#ffffff" />
              <Text style={styles.cardTitle}>Instrucciones</Text>
            </View>
            <Text style={styles.cardText}>
              El cuestionario SARC-F es una herramienta de detección para sarcopenia.
              Ingrese un valor de 0 a 2 para cada ítem. Un puntaje total ≥ 4 indica alta probabilidad de sarcopenia.
            </Text>
          </View>

          {/* Fuerza */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="fitness" size={24} color="#ffffff" />
              <Text style={styles.cardTitle}>1. Fuerza</Text>
            </View>
            <Text style={styles.cardText}>¿Qué tanta dificultad tiene para levantar y cargar 4.5 kg?</Text>
            <Text style={styles.cardSubtext}>0 = Ninguna, 1 = Alguna, 2 = Mucha o incapaz</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ingrese puntaje (0-2)"
              value={strength}
              onChangeText={setStrength}
              maxLength={1}
            />
          </View>

          {/* Asistencia al caminar */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="walk" size={24} color="#ffffff" />
              <Text style={styles.cardTitle}>2. Asistencia al caminar</Text>
            </View>
            <Text style={styles.cardText}>¿Qué tanta dificultad tiene para caminar por una habitación?</Text>
            <Text style={styles.cardSubtext}>0 = Ninguna, 1 = Alguna, 2 = Mucha, usa ayudas o incapaz</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ingrese puntaje (0-2)"
              value={assistance}
              onChangeText={setAssistance}
              maxLength={1}
            />
          </View>

          {/* Levantarse de una silla */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="body" size={24} color="#ffffff" />
              <Text style={styles.cardTitle}>3. Levantarse de una silla</Text>
            </View>
            <Text style={styles.cardText}>¿Qué tanta dificultad tiene para levantarse de una silla o cama?</Text>
            <Text style={styles.cardSubtext}>0 = Ninguna, 1 = Alguna, 2 = Mucha o incapaz sin ayuda</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ingrese puntaje (0-2)"
              value={riseFromChair}
              onChangeText={setRiseFromChair}
              maxLength={1}
            />
          </View>

          {/* Subir escaleras */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="trending-up" size={24} color="#ffffff" />
              <Text style={styles.cardTitle}>4. Subir escaleras</Text>
            </View>
            <Text style={styles.cardText}>¿Qué tanta dificultad tiene para subir 10 escalones?</Text>
            <Text style={styles.cardSubtext}>0 = Ninguna, 1 = Alguna, 2 = Mucha o incapaz</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ingrese puntaje (0-2)"
              value={climbStairs}
              onChangeText={setClimbStairs}
              maxLength={1}
            />
          </View>

          {/* Caídas */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="alert-circle" size={24} color="#ffffff" />
              <Text style={styles.cardTitle}>5. Caídas</Text>
            </View>
            <Text style={styles.cardText}>¿Cuántas veces se ha caído en el último año?</Text>
            <Text style={styles.cardSubtext}>0 = Ninguna, 1 = 1-3 caídas, 2 = 4 o más caídas</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ingrese puntaje (0-2)"
              value={falls}
              onChangeText={setFalls}
              maxLength={1}
            />
          </View>

          {/* Botones de acción */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, !allFieldsFilled() && styles.actionButtonDisabled]}
              onPress={calculateScore}
              disabled={!allFieldsFilled()}
            >
              <Ionicons name="calculator" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>Calcular Puntaje</Text>
            </TouchableOpacity>
          </View>

          {/* Resultados */}
          {mostrarResultado && (
            <View style={[styles.card, { borderColor: getColorPorPuntaje() }]}>
              <View style={[styles.cardHeader, { backgroundColor: getColorPorPuntaje() }]}>
                <Ionicons name={getIconoPorPuntaje()} size={24} color="#ffffff" />
                <Text style={[styles.cardTitle, { color: '#ffffff' }]}>Resultado</Text>
              </View>

              <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>Puntaje total:</Text>
                <Text style={[styles.resultValue, { color: getColorPorPuntaje() }]}>{totalScore}</Text>
              </View>

              <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>Interpretación:</Text>
                <Text style={[styles.resultValue, { color: getColorPorPuntaje() }]}>{getInterpretacion()}</Text>
              </View>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: getColorPorPuntaje() }]}
                onPress={guardarYNavegar}
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
    paddingBottom: 8,
  },
  cardSubtext: {
    fontSize: 14,
    color: '#666666',
    paddingHorizontal: 16,
    paddingBottom: 12,
    fontStyle: 'italic',
  },
  input: {
    height: 50,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  actionButtonsContainer: {
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
  resultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
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

export default PantallaPruebaSARCF;
