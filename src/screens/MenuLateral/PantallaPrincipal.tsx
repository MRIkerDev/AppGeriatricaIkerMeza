'use client';

import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { cargarPacientes, eliminarPaciente, obtenerCitasPorDoctor } from '../../database/database';
import { eliminarPacienteFirebase } from '../../utils/firebaseService';
import { hayInternet } from '../../utils/checarInternet';
import { guardarEliminacionPendiente } from '../../database/database';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PantallaPrincipal = ({ navigation, route }: any) => {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [filteredPacientes, setFilteredPacientes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [doctorNombre, setDoctorNombre] = useState('');
  const [citasHoy, setCitasHoy] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPacientes: 0,
    citasPendientes: 0,
    citasHoy: 0,
  });

  // Cargar nombre del doctor
  useEffect(() => {
    const cargarNombreDoctor = async () => {
      try {
        const nombre = await AsyncStorage.getItem('doctor_nombre');
        if (nombre) {
          setDoctorNombre(nombre);
        }
      } catch (error) {
        console.log('Error al cargar nombre del doctor:', error);
      }
    };

    cargarNombreDoctor();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const cargarDatos = async () => {
        try {
          setLoading(true);
          const pacientesCargados = await cargarPacientes();
          setPacientes(pacientesCargados);
          setFilteredPacientes(pacientesCargados);

          // Cargar citas para estadísticas
          const doctorId = await AsyncStorage.getItem('doctor_id');
          if (doctorId) {
            const todasLasCitas = await obtenerCitasPorDoctor(Number(doctorId));

            // Filtrar citas de hoy
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const manana = new Date(hoy);
            manana.setDate(manana.getDate() + 1);

            const citasDeHoy = todasLasCitas.filter((cita) => {
              const fechaCita = new Date(cita.FechaHoraCita);
              return fechaCita >= hoy && fechaCita < manana;
            });

            // Citas pendientes
            const citasPendientes = todasLasCitas.filter((cita) => cita.EstadoCita === 'pendiente');

            setCitasHoy(citasDeHoy);
            setStats({
              totalPacientes: pacientesCargados.length,
              citasPendientes: citasPendientes.length,
              citasHoy: citasDeHoy.length,
            });
          }
        } catch (error) {
          console.log('Error al cargar datos:', error);
        } finally {
          setLoading(false);
        }
      };

      cargarDatos();

      const nuevo = route.params?.nuevoPaciente;
      const actualizado = route.params?.pacienteActualizado;

      if (nuevo) {
        setPacientes((prev) => {
          const yaExiste = prev.some((p) => p.id === nuevo.id);
          if (yaExiste) {
            return prev;
          }
          const updatedPacientes = [...prev, { ...nuevo, id: nuevo.id.toString() }];
          setFilteredPacientes(updatedPacientes);
          return updatedPacientes;
        });
      }

      if (actualizado) {
        setPacientes((prev) => {
          const updatedPacientes = prev.map((p) => (p.id === actualizado.id ? { ...actualizado } : p));
          setFilteredPacientes(updatedPacientes);
          return updatedPacientes;
        });
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPacientes(pacientes);
    } else {
      const filtered = pacientes.filter((paciente) => paciente.nombre.toLowerCase().includes(searchQuery.toLowerCase()));
      setFilteredPacientes(filtered);
    }
  }, [searchQuery, pacientes]);

  const editar = (paciente: any) => {
    navigation.navigate('PantallaEditarPaciente', {
      pacienteId: paciente.id,
      paciente: paciente,
    });
  };

  const eliminar = (pacienteId: string) => {
    Alert.alert('Eliminar Paciente', '¿Estás seguro de eliminar este paciente?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Eliminar',
        onPress: async () => {
          try {
            const tieneInternet = await hayInternet();
            await eliminarPaciente(pacienteId);
            setPacientes((prev) => {
              const updatedPacientes = prev.filter((p) => p.id !== pacienteId);
              setFilteredPacientes(updatedPacientes);
              return updatedPacientes;
            });
            if (tieneInternet) {
              await eliminarPacienteFirebase(pacienteId); //ELIMINAR EN FIREBASE
            } else {
              // eslint-disable-next-line radix
              await guardarEliminacionPendiente(Number.parseInt(pacienteId)); //GUARDAR EN TABLA ELIMINACIONES PENDIENTES
              console.log('Guardado como eliminación pendiente');
            }
          } catch (error) {
            console.log('Error al eliminar paciente:', error);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
        <ActivityIndicator size="large" color="#4D96FF" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel Principal</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Bienvenido, <Text style={styles.doctorName}>{doctorNombre}</Text>
          </Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('es-ES', { dateStyle: 'full' })}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#4D96FF" />
            <Text style={styles.statNumber}>{stats.totalPacientes}</Text>
            <Text style={styles.statLabel}>Pacientes</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color="#4D96FF" />
            <Text style={styles.statNumber}>{stats.citasPendientes}</Text>
            <Text style={styles.statLabel}>Citas Pendientes</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="today" size={24} color="#4D96FF" />
            <Text style={styles.statNumber}>{stats.citasHoy}</Text>
            <Text style={styles.statLabel}>Citas Hoy</Text>
          </View>
        </View>

        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('PantallaAgregarPaciente')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={22} color="#fff" />
            <Text style={styles.quickActionText}>Nuevo Paciente</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('PantallaCrearCita')}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={22} color="#fff" />
            <Text style={styles.quickActionText}>Nueva Cita</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('PantallaMisCitas')}
            activeOpacity={0.8}
          >
            <Ionicons name="list" size={22} color="#fff" />
            <Text style={styles.quickActionText}>Ver Citas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('PantallaClima')}
            activeOpacity={0.8}
          >
            <Ionicons name="partly-sunny" size={22} color="#fff" />
            <Text style={styles.quickActionText}>Clima</Text>
          </TouchableOpacity>
        </View>

        {citasHoy.length > 0 && (
          <View style={styles.todayAppointmentsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="today" size={22} color="#0A2463" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionHeaderTitle}>Citas de Hoy</Text>
            </View>

            {citasHoy.slice(0, 3).map((cita) => (
              <TouchableOpacity
                key={cita.id.toString()}
                style={styles.todayAppointmentCard}
                onPress={async () => {
                  try {
                    // eslint-disable-next-line @typescript-eslint/no-shadow
                    const paciente = await cargarPacientes().then((pacientes) =>
                      pacientes.find((p) => p.id === cita.PacienteID.toString()),
                    );
                    if (paciente) {
                      navigation.navigate('PantallaVerCita', { cita, paciente });
                    }
                  } catch (error) {
                    console.error('Error al obtener paciente:', error);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.appointmentTime}>
                  <Ionicons name="time-outline" size={16} color="#4D96FF" />
                  <Text style={styles.appointmentTimeText}>
                    {new Date(cita.FechaHoraCita).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Text style={styles.appointmentReason} numberOfLines={1}>
                  {cita.MotivoCita}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}

            {citasHoy.length > 3 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('PantallaMisCitas')}
                activeOpacity={0.8}
              >
                <Text style={styles.viewAllButtonText}>Ver todas las citas</Text>
                <Ionicons name="arrow-forward" size={16} color="#4D96FF" />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.patientsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={22} color="#0A2463" style={styles.sectionHeaderIcon} />
            <Text style={styles.sectionHeaderTitle}>Mis Pacientes</Text>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar paciente..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {filteredPacientes.length === 0 ? (
            <View style={styles.emptyContainer}>
              {searchQuery.length > 0 ? (
                <>
                  <Ionicons name="search" size={50} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No se encontraron pacientes con "{searchQuery}"</Text>
                </>
              ) : (
                <>
                  <Ionicons name="people-outline" size={50} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No hay pacientes registrados aún.</Text>
                  <TouchableOpacity
                    style={styles.addFirstPatientButton}
                    onPress={() => navigation.navigate('PantallaCrearPaciente')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addFirstPatientButtonText}>Añadir primer paciente</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredPacientes}
              renderItem={({ item }) => (
                <View style={styles.patientCard}>
                  <TouchableOpacity
                    style={styles.patientInfo}
                    onPress={() =>
                      navigation.navigate('PantallaVerPaciente', {
                        paciente: item,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.patientAvatar}>
                      <Text style={styles.patientAvatarText}>{item.nombre.charAt(0)}</Text>
                    </View>
                    <View style={styles.patientDetails}>
                      <Text style={styles.patientName}>{item.nombre}</Text>
                      <View style={styles.patientSubDetails}>
                        <View style={styles.patientSubDetail}>
                          <Ionicons name="calendar-outline" size={14} color="#6B7280" style={styles.patientSubIcon} />
                          <Text style={styles.patientSubText}>
                            {item.edad ? `${item.edad} años` : 'Edad no registrada'}
                          </Text>
                        </View>
                        <View style={styles.patientSubDetail}>
                          <Ionicons
                            name="calendar-number-outline"
                            size={14}
                            color="#6B7280"
                            style={styles.patientSubIcon}
                          />
                          <Text style={styles.patientSubText}>{item.fechaNacimiento || 'Fecha no registrada'}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.patientActions}>
                    <TouchableOpacity
                      style={styles.patientActionButton}
                      onPress={() => editar(item)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="create-outline" size={20} color="#4D96FF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.patientActionButton}
                      onPress={() => eliminar(item.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.patientActionButton}
                      onPress={() =>
                        navigation.navigate('PantallaCrearCita', {
                          pacienteSeleccionado: item,
                        })
                      }
                      activeOpacity={0.8}
                    >
                      <Ionicons name="calendar-outline" size={20} color="#10B981" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              nestedScrollEnabled={true}
            />
          )}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    padding: 16,
    paddingBottom: 8,
  },
  welcomeText: {
    fontSize: 18,
    color: '#1F2937',
  },
  doctorName: {
    fontWeight: 'bold',
    color: '#0A2463',
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A2463',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: '#4D96FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  todayAppointmentsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderIcon: {
    marginRight: 8,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2463',
  },
  todayAppointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  appointmentTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
  appointmentReason: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  viewAllButtonText: {
    color: '#4D96FF',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  patientsSection: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  clearButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  addFirstPatientButton: {
    backgroundColor: '#4D96FF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  addFirstPatientButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  patientCard: {
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
  patientInfo: {
    flexDirection: 'row',
    padding: 16,
  },
  patientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4D96FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patientAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  patientDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  patientSubDetails: {
    flexDirection: 'column',
  },
  patientSubDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  patientSubIcon: {
    marginRight: 4,
  },
  patientSubText: {
    fontSize: 14,
    color: '#6B7280',
  },
  patientActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  patientActionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
});

export default PantallaPrincipal;
