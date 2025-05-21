'use client';

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { guardarPruebaFirebase } from '../../../utils/firebaseService';
import { guardarResultado } from '../../../database/database';
import { hayInternet } from '../../../utils/checarInternet';
import Ionicons from 'react-native-vector-icons/Ionicons';

const activities = [
  {
    id: '1',
    name: 'Alimentación',
    description: 'Capacidad para alimentarse por sí mismo',
  },
  {
    id: '2',
    name: 'Vestido',
    description: 'Capacidad para vestirse y desvestirse',
  },
  {
    id: '3',
    name: 'Baño',
    description: 'Capacidad para bañarse o ducharse',
  },
  {
    id: '4',
    name: 'Continencia',
    description: 'Control de esfínteres urinarios y fecales',
  },
  {
    id: '5',
    name: 'Transferencias',
    description: 'Capacidad para moverse de la cama al sillón y viceversa',
  },
  {
    id: '6',
    name: 'Uso del sanitario',
    description: 'Capacidad para usar el retrete',
  },
];

const PantallaPruebaKatz = ({ navigation, route }: any) => {
  const { pacienteId } = route.params;
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [allAnswered, setAllAnswered] = useState(false);

  // Verificar si todas las actividades tienen respuesta
  useEffect(() => {
    const answered = activities.every((activity) => scores[activity.id] === 0 || scores[activity.id] === 1);
    setAllAnswered(answered);
  }, [scores]);

  // Función para alternar entre independiente (1) y dependiente (0)
  const toggleScore = (id: string) => {
    setScores((prevScores) => ({
      ...prevScores,
      [id]: prevScores[id] === 1 ? 0 : 1,
    }));
  };

  // Calcula el puntaje total sumando las respuestas
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  // Determina la interpretación del resultado
  const getInterpretation = () => {
    if (totalScore >= 5) {return { text: 'Independencia o dependencia leve', color: '#4CAF50' };}
    if (totalScore >= 3) {return { text: 'Dependencia moderada', color: '#FF9800' };}
    return { text: 'Dependencia severa', color: '#F44336' };
  };

  // Función para guardar y navegar al total
  const manejarEnvio = async () => {
    try {
      setLoading(true);
      const hayNet = await hayInternet();

      if (pacienteId) {
        await guardarResultado(pacienteId, 'Indice de Katz', totalScore);

        if (hayNet) {
          await guardarPruebaFirebase(pacienteId, 'Indice de Katz', totalScore);
        }

        setLoading(false);
        Alert.alert('Éxito', 'Resultados guardados correctamente', [
          {
            text: 'OK',
            onPress: () =>
              navigation.navigate('PantallaPruebas', {
                total: totalScore,
                pacienteId: pacienteId,
              }),
          },
        ]);
      } else {
        setLoading(false);
        Alert.alert('Error', 'No se proporcionó ID del paciente');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error al guardar el resultado:', error);
      Alert.alert('Error', 'No se pudo guardar el resultado');
    }
  };

  const interpretation = getInterpretation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0A2463" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Índice de Katz</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Tarjeta de instrucciones */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Instrucciones</Text>
          </View>
          <Text style={styles.instructionText}>
            Evalúe la capacidad del paciente para realizar cada actividad. Seleccione "Independiente" si puede
            realizarla sin ayuda o "Dependiente" si requiere asistencia.
          </Text>
        </View>

        {/* Tarjeta de actividades */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="list" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Actividades</Text>
          </View>

          {activities.map((item) => (
            <View key={item.id} style={styles.activityContainer}>
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>{item.name}</Text>
                <Text style={styles.activityDescription}>{item.description}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  scores[item.id] === 1
                    ? styles.independentButton
                    : scores[item.id] === 0
                      ? styles.dependentButton
                      : styles.neutralButton,
                ]}
                onPress={() => toggleScore(item.id)}
              >
                {scores[item.id] === undefined ? (
                  <Text style={styles.toggleButtonText}>Seleccionar</Text>
                ) : (
                  <>
                    <Ionicons
                      name={scores[item.id] === 1 ? 'checkmark-circle' : 'close-circle'}
                      size={20}
                      color="white"
                    />
                    <Text style={styles.toggleButtonText}>
                      {scores[item.id] === 1 ? 'Independiente' : 'Dependiente'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Tarjeta de resultados */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="stats-chart" size={24} color="#0A2463" />
            <Text style={styles.cardTitle}>Resultados</Text>
          </View>

          <View style={styles.resultContainer}>
            <Text style={styles.scoreLabel}>Puntaje Total:</Text>
            <Text style={styles.scoreValue}>{totalScore}/6</Text>
          </View>

          {Object.keys(scores).length > 0 && (
            <View style={[styles.interpretationContainer, { backgroundColor: interpretation.color + '20' }]}>
              <Ionicons
                name={totalScore >= 5 ? 'thumbs-up' : totalScore >= 3 ? 'alert-circle' : 'warning'}
                size={24}
                color={interpretation.color}
              />
              <Text style={[styles.interpretationText, { color: interpretation.color }]}>{interpretation.text}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, (!allAnswered || loading) && styles.disabledButton]}
            onPress={manejarEnvio}
            disabled={!allAnswered || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Guardar Resultados</Text>
              </>
            )}
          </TouchableOpacity>

          {!allAnswered && Object.keys(scores).length > 0 && (
            <Text style={styles.warningText}>Por favor evalúe todas las actividades antes de guardar</Text>
          )}
        </View>

        {/* Botón de regresar en la parte inferior */}
        <TouchableOpacity
          style={styles.returnButton}
          onPress={() => navigation.navigate('PantallaPruebas', { pacienteId })}
        >
          <Ionicons name="arrow-back-circle" size={20} color="#FFFFFF" />
          <Text style={styles.returnButtonText}>Volver a Pruebas</Text>
        </TouchableOpacity>

        {/* Espacio adicional al final */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0A2463',
  },
  placeholder: {
    width: 40,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2463',
    marginLeft: 8,
  },
  instructionText: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 22,
  },
  activityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },
  activityInfo: {
    flex: 1,
    paddingRight: 12,
  },
  activityText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
  },
  activityDescription: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 130,
  },
  neutralButton: {
    backgroundColor: '#CBD5E0',
  },
  independentButton: {
    backgroundColor: '#4CAF50',
  },
  dependentButton: {
    backgroundColor: '#F44336',
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2D3748',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A2463',
  },
  interpretationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  interpretationText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4D96FF',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  warningText: {
    color: '#F44336',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#718096',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  returnButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  bottomSpace: {
    height: 20,
  },
});

export default PantallaPruebaKatz;
