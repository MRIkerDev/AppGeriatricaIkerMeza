'use client';

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { obtenerResultadosPorPaciente } from '../../database/database';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PantallaHistorialPruebas = ({ route, navigation }: any) => {
  const { pacienteId, pacienteNombre } = route.params;
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarResultados = async () => {
      try {
        setLoading(true);
        const data = await obtenerResultadosPorPaciente(pacienteId);
        setResultados(data);
      } catch (error) {
        console.error('Error al cargar resultados:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarResultados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para obtener el icono según el tipo de prueba
  const getTestIcon = (nombrePrueba: string) => {
    const nombreLower = nombrePrueba.toLowerCase();
    if (nombreLower.includes('cognitiv') || nombreLower.includes('mental') || nombreLower.includes('moca')) {
      return 'brain';
    } else if (nombreLower.includes('afectiv') || nombreLower.includes('depresi') || nombreLower.includes('cesd')) {
      return 'heart';
    } else if (nombreLower.includes('funcion') || nombreLower.includes('katz') || nombreLower.includes('marcha')) {
      return 'body';
    } else if (nombreLower.includes('nutri') || nombreLower.includes('mna') || nombreLower.includes('must')) {
      return 'nutrition';
    } else if (nombreLower.includes('entorno') || nombreLower.includes('maltrato') || nombreLower.includes('oars')) {
      return 'home';
    } else {
      return 'clipboard';
    }
  };

  // Función para obtener el color según el tipo de prueba
  const getTestColor = (nombrePrueba: string) => {
    const nombreLower = nombrePrueba.toLowerCase();
    if (nombreLower.includes('cognitiv') || nombreLower.includes('mental') || nombreLower.includes('moca')) {
      return '#4D96FF';
    } else if (nombreLower.includes('afectiv') || nombreLower.includes('depresi') || nombreLower.includes('cesd')) {
      return '#F87171';
    } else if (nombreLower.includes('funcion') || nombreLower.includes('katz') || nombreLower.includes('marcha')) {
      return '#10B981';
    } else if (nombreLower.includes('nutri') || nombreLower.includes('mna') || nombreLower.includes('must')) {
      return '#F59E0B';
    } else if (nombreLower.includes('entorno') || nombreLower.includes('maltrato') || nombreLower.includes('oars')) {
      return '#8B5CF6';
    } else {
      return '#6B7280';
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial de Pruebas</Text>
      </View>

      <View style={styles.patientInfoContainer}>
        <View style={styles.patientAvatarContainer}>
          <Text style={styles.patientAvatarText}>{pacienteNombre ? pacienteNombre.charAt(0) : '?'}</Text>
        </View>
        <Text style={styles.patientName}>{pacienteNombre || 'Paciente'}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4D96FF" />
          <Text style={styles.loadingText}>Cargando historial de pruebas...</Text>
        </View>
      ) : resultados.length > 0 ? (
        <FlatList
          data={resultados}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.resultadoCard}>
              <View
                style={[styles.resultadoIconContainer, { backgroundColor: getTestColor(item.nombrePrueba) + '20' }]}
              >
                <Ionicons name={getTestIcon(item.nombrePrueba)} size={24} color={getTestColor(item.nombrePrueba)} />
              </View>
              <View style={styles.resultadoContent}>
                <Text style={styles.resultadoTitle}>{item.nombrePrueba}</Text>
                <View style={styles.resultadoDetails}>
                  <View style={styles.resultadoDetailRow}>
                    <Ionicons name="stats-chart" size={16} color="#4D96FF" style={styles.detailIcon} />
                    <Text style={styles.resultadoDetailLabel}>Puntaje:</Text>
                    <Text style={styles.resultadoDetailValue}>{item.puntaje}</Text>
                  </View>
                  <View style={styles.resultadoDetailRow}>
                    <Ionicons name="calendar" size={16} color="#4D96FF" style={styles.detailIcon} />
                    <Text style={styles.resultadoDetailLabel}>Fecha:</Text>
                    <Text style={styles.resultadoDetailValue}>{formatDate(item.fecha)}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="clipboard-outline" size={60} color="#9CA3AF" />
          <Text style={styles.emptyText}>No hay pruebas registradas para este paciente.</Text>
        </View>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
        <Ionicons name="arrow-back-outline" size={22} color="#4B5563" style={styles.buttonIcon} />
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  header: {
    backgroundColor: '#0A2463',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  patientInfoContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  patientAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4D96FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  patientAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2463',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4B5563',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  resultadoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resultadoIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultadoContent: {
    flex: 1,
  },
  resultadoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2463',
    marginBottom: 8,
  },
  resultadoDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
  },
  resultadoDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailIcon: {
    marginRight: 6,
  },
  resultadoDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    width: 60,
  },
  resultadoDetailValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  backButtonText: {
    color: '#4B5563',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default PantallaHistorialPruebas;
