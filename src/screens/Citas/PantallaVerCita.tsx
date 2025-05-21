'use client';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { obtenerRecetasPorCita } from '../../database/database';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PantallaVerCita = ({ route, navigation }: any) => {
  const { cita, paciente } = route.params;
  const [recetas, setRecetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const cargarRecetas = async () => {
        try {
          setLoading(true);
          const id = await AsyncStorage.getItem('doctor_id');
          if (id) {
            const recetas = await obtenerRecetasPorCita(cita.id);
            setRecetas(recetas);
          }
        } catch (error) {
          console.log('Error al cargar citas:', error);
        } finally {
          setLoading(false);
        }
      };

      cargarRecetas();

      const nuevaReceta = route.params?.nuevaReceta;
      const recetaEditada = route.params?.recetaEditada;

      if (nuevaReceta) {
        setRecetas((prev) => {
          const yaExiste = prev.some((c) => c.RecetaID === nuevaReceta.RecetaID);
          if (yaExiste) {
            return prev;
          }
          return [...prev, nuevaReceta];
        });
      }

      if (recetaEditada) {
        setRecetas((prev) => prev.map((c) => (c.RecetaID === recetaEditada.RecetaID ? { ...recetaEditada } : c)));
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const editar = (receta: any) => {
    navigation.navigate('PantallaEditarReceta', { receta, paciente, cita });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <Text style={styles.headerTitle}>Detalles de la Cita</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="person" size={22} color="#0A2463" style={styles.cardHeaderIcon} />
                <Text style={styles.cardHeaderTitle}>Ficha del Paciente</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Ionicons name="person-outline" size={18} color="#4D96FF" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Nombre:</Text>
                </View>
                <Text style={styles.infoValue}>{paciente.nombre || 'No registrado'}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Ionicons name="calendar-outline" size={18} color="#4D96FF" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Edad:</Text>
                </View>
                <Text style={styles.infoValue}>{paciente.edad || 'No registrado'}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Ionicons name="calendar-number-outline" size={18} color="#4D96FF" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Fecha de Nacimiento:</Text>
                </View>
                <Text style={styles.infoValue}>{paciente.fechaNacimiento || 'No registrado'}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Ionicons name="fitness-outline" size={18} color="#4D96FF" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Enfermedades:</Text>
                </View>
                <Text style={styles.infoValue}>{paciente.enfermedades || 'No registrado'}</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={22} color="#0A2463" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionHeaderTitle}>Detalles de la Cita</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Ionicons name="time-outline" size={18} color="#4D96FF" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Fecha y Hora:</Text>
                </View>
                <Text style={styles.infoValue}>{formatDateTime(cita.FechaHoraCita)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Ionicons name="help-circle-outline" size={18} color="#4D96FF" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Motivo:</Text>
                </View>
                <Text style={styles.infoValue}>{cita.MotivoCita}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Ionicons name="create-outline" size={18} color="#4D96FF" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Notas:</Text>
                </View>
                <Text style={styles.infoValue}>{cita.NotasAdicionales || 'Sin notas'}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Ionicons name="medkit-outline" size={18} color="#4D96FF" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Diagnóstico:</Text>
                </View>
                <Text style={styles.infoValue}>{cita.Diagnostico || 'Sin diagnóstico'}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Ionicons name="medical-outline" size={18} color="#4D96FF" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Tratamiento:</Text>
                </View>
                <Text style={styles.infoValue}>{cita.Tratamiento || 'Sin tratamiento'}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#4D96FF" style={styles.infoIcon} />
                  <Text style={styles.infoLabel}>Estado:</Text>
                </View>
                <Text
                  style={[
                    styles.infoValue,
                    styles.statusValue,
                    cita.EstadoCita === 'pendiente' ? styles.statusPending : styles.statusCompleted,
                  ]}
                >
                  {cita.EstadoCita.toUpperCase()}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.createRecipeButton}
              onPress={() => navigation.navigate('PantallaCrearReceta', { cita, paciente })}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={22} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.createRecipeButtonText}>Crear Receta</Text>
            </TouchableOpacity>

            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={22} color="#0A2463" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionHeaderTitle}>Recetas Médicas</Text>
            </View>

            {recetas.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-outline" size={50} color="#9CA3AF" />
                <Text style={styles.emptyText}>No hay recetas para esta cita.</Text>
              </View>
            )}
          </>
        }
        data={recetas}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item: receta }: any) => (
          <View style={styles.recipeCard}>
            <TouchableOpacity
              style={styles.recipeContent}
              onPress={() =>
                navigation.navigate('PantallaEditarReceta', {
                  receta,
                  cita,
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.recipeHeader}>
                <Ionicons name="medical" size={22} color="#0A2463" />
                <Text style={styles.recipeTitle}>Receta Médica</Text>
              </View>

              <View style={styles.recipeInfo}>
                <View style={styles.recipeInfoRow}>
                  <Ionicons name="medkit-outline" size={18} color="#4D96FF" style={styles.recipeInfoIcon} />
                  <Text style={styles.recipeInfoLabel}>Medicamentos:</Text>
                  <Text style={styles.recipeInfoValue}>{receta.Medicamento}</Text>
                </View>

                <View style={styles.recipeInfoRow}>
                  <Ionicons name="information-circle-outline" size={18} color="#4D96FF" style={styles.recipeInfoIcon} />
                  <Text style={styles.recipeInfoLabel}>Dosis:</Text>
                  <Text style={styles.recipeInfoValue}>{Number(receta.Dosis) || 'Sin dosis'}</Text>
                </View>

                <View style={styles.recipeInfoRow}>
                  <Ionicons name="calendar-outline" size={18} color="#4D96FF" style={styles.recipeInfoIcon} />
                  <Text style={styles.recipeInfoLabel}>Fecha:</Text>
                  <Text style={styles.recipeInfoValue}>{formatDate(receta.FechaEmision)}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.recipeActions}>
              <TouchableOpacity style={styles.editButton} onPress={() => editar(receta)} activeOpacity={0.8}>
                <Ionicons name="create-outline" size={18} color="#fff" style={styles.editButtonIcon} />
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="arrow-back-outline" size={22} color="#4B5563" style={styles.buttonIcon} />
            <Text style={styles.backButtonText}>Regresar</Text>
          </TouchableOpacity>
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
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cardHeaderIcon: {
    marginRight: 8,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2463',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 150,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  statusValue: {
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPending: {
    color: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  statusCompleted: {
    color: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionHeaderIcon: {
    marginRight: 8,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0A2463',
  },
  createRecipeButton: {
    backgroundColor: '#4D96FF',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  createRecipeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  recipeContent: {
    padding: 16,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2463',
    marginLeft: 8,
  },
  recipeInfo: {
    marginTop: 4,
  },
  recipeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeInfoIcon: {
    marginRight: 6,
  },
  recipeInfoLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    width: 110,
    marginRight: 4,
  },
  recipeInfoValue: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  recipeActions: {
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
  },
  editButtonIcon: {
    marginRight: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#4B5563',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default PantallaVerCita;
