'use client';

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { obtenerCitasPorDoctor, obtenerPacientePorId } from '../../database/database';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const agruparCitasPorFecha = (citas: any[]) => {
  const agrupadas: Record<string, any[]> = {};
  citas.forEach((cita) => {
    const fecha = new Date(cita.FechaHoraCita).toISOString().split('T')[0];
    if (!agrupadas[fecha]) {
      agrupadas[fecha] = [];
    }
    agrupadas[fecha].push(cita);
  });
  return agrupadas;
};

const PantallaMisCitas = ({ navigation, route }: any) => {
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const cargarCitas = async () => {
        try {
          setLoading(true);
          const id = await AsyncStorage.getItem('doctor_id');
          if (id) {
            const citasObtenidas = await obtenerCitasPorDoctor(Number(id));
            setCitas(citasObtenidas);
          }
        } catch (error) {
          console.log('Error al cargar citas:', error);
        } finally {
          setLoading(false);
        }
      };

      cargarCitas();

      const nuevaCita = route.params?.nuevaCita;
      const citaEditada = route.params?.citaEditada;

      if (nuevaCita) {
        setCitas((prev) => {
          const yaExiste = prev.some((c) => c.CitaID === nuevaCita.CitaID);
          if (yaExiste) {
            return prev;
          }
          return [...prev, nuevaCita];
        });
      }

      if (citaEditada) {
        setCitas((prev) => prev.map((c) => (c.CitaID === citaEditada.CitaID ? { ...citaEditada } : c)));
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const citasAgrupadas = agruparCitasPorFecha(citas);
  const fechas = Object.keys(citasAgrupadas).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const editar = (cita: any) => {
    navigation.navigate('PantallaEditarCita', {
      citaId: cita.id,
      cita: cita,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return styles.statusPending;
      case 'cancelada':
        return styles.statusCancelled;
      case 'realizada':
        return styles.statusCompleted;
      default:
        return styles.statusPending;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return 'time-outline';
      case 'cancelada':
        return 'close-circle-outline';
      case 'realizada':
        return 'checkmark-circle-outline';
      default:
        return 'time-outline';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
        <ActivityIndicator size="large" color="#4D96FF" />
        <Text style={styles.loadingText}>Cargando citas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Citas</Text>
      </View>

      <TouchableOpacity
        style={styles.createAppointmentButton}
        onPress={() => navigation.navigate('PantallaCrearCita')}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle-outline" size={24} color="#fff" style={styles.createButtonIcon} />
        <Text style={styles.createAppointmentButtonText}>Crear Nueva Cita</Text>
      </TouchableOpacity>

      <FlatList
        data={fechas}
        keyExtractor={(fecha) => fecha}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item: fecha }) => (
          <View style={styles.dateSection}>
            <View style={styles.dateSectionHeader}>
              <Ionicons name="calendar" size={22} color="#0A2463" style={styles.dateSectionIcon} />
              <Text style={styles.dateSectionTitle}>{formatDate(fecha)}</Text>
            </View>

            {citasAgrupadas[fecha].map((cita: any) => (
              <View key={cita.id.toString()} style={styles.appointmentCard}>
                <TouchableOpacity
                  style={styles.appointmentContent}
                  onPress={async () => {
                    try {
                      console.log('PacienteID recibido:', cita.PacienteID);
                      const paciente = await obtenerPacientePorId(cita.PacienteID);
                      if (!paciente) {
                        console.warn('Paciente no encontrado en BD');
                      }
                      navigation.navigate('PantallaVerCita', { cita, paciente });
                    } catch (error) {
                      console.error('Error al obtener paciente:', error);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.appointmentHeader}>
                    <View style={styles.timeContainer}>
                      <Ionicons name="time-outline" size={18} color="#4D96FF" style={styles.timeIcon} />
                      <Text style={styles.timeText}>{formatTime(cita.FechaHoraCita)}</Text>
                    </View>

                    <View style={[styles.statusBadge, getStatusStyle(cita.EstadoCita)]}>
                      <Ionicons
                        name={getStatusIcon(cita.EstadoCita)}
                        size={16}
                        color={
                          cita.EstadoCita.toLowerCase() === 'pendiente'
                            ? '#F59E0B'
                            : cita.EstadoCita.toLowerCase() === 'cancelada'
                              ? '#EF4444'
                              : '#10B981'
                        }
                        style={styles.statusIcon}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          // eslint-disable-next-line react-native/no-inline-styles
                          {
                            color:
                              cita.EstadoCita.toLowerCase() === 'pendiente'
                                ? '#F59E0B'
                                : cita.EstadoCita.toLowerCase() === 'cancelada'
                                  ? '#EF4444'
                                  : '#10B981',
                          },
                        ]}
                      >
                        {cita.EstadoCita.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.appointmentBody}>
                    <View style={styles.appointmentRow}>
                      <Ionicons name="help-circle-outline" size={18} color="#4D96FF" style={styles.rowIcon} />
                      <Text style={styles.rowLabel}>Motivo:</Text>
                      <Text style={styles.rowValue}>{cita.MotivoCita}</Text>
                    </View>

                    {cita.NotasAdicionales && (
                      <View style={styles.appointmentRow}>
                        <Ionicons name="document-text-outline" size={18} color="#4D96FF" style={styles.rowIcon} />
                        <Text style={styles.rowLabel}>Notas:</Text>
                        <Text style={styles.rowValue}>{cita.NotasAdicionales}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                <View style={styles.appointmentActions}>
                  <TouchableOpacity style={styles.editButton} onPress={() => editar(cita)} activeOpacity={0.8}>
                    <Ionicons name="create-outline" size={18} color="#fff" style={styles.editButtonIcon} />
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={async () => {
                      try {
                        const paciente = await obtenerPacientePorId(cita.PacienteID);
                        navigation.navigate('PantallaVerCita', { cita, paciente });
                      } catch (error) {
                        console.error('Error al obtener paciente:', error);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="eye-outline" size={18} color="#fff" style={styles.viewButtonIcon} />
                    <Text style={styles.viewButtonText}>Ver</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color="#9CA3AF" />
            <Text style={styles.emptyText}>No hay citas registradas aún.</Text>
            <Text style={styles.emptySubtext}>Crea una nueva cita usando el botón superior.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
  },
  loadingText: {
    marginTop: 10,
    color: '#0A2463',
    fontSize: 16,
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
  createAppointmentButton: {
    backgroundColor: '#4D96FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  createButtonIcon: {
    marginRight: 8,
  },
  createAppointmentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },
  dateSection: {
    marginBottom: 20,
  },
  dateSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateSectionIcon: {
    marginRight: 8,
  },
  dateSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2463',
    textTransform: 'capitalize',
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  appointmentContent: {
    padding: 16,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusCompleted: {
    backgroundColor: '#D1FAE5',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  appointmentBody: {
    marginTop: 4,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  rowIcon: {
    marginRight: 4,
    marginTop: 2,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    width: 60,
    marginRight: 4,
  },
  rowValue: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#F3F4F6',
    padding: 8,
  },
  editButton: {
    backgroundColor: '#4D96FF',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  editButtonIcon: {
    marginRight: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  viewButton: {
    backgroundColor: '#0A2463',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonIcon: {
    marginRight: 4,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default PantallaMisCitas;
