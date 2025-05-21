
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PantallaVerPaciente = ({ route, navigation }: any) => {
  const { paciente } = route.params;
  let antecedentes = paciente.antecedentes;

  if (typeof antecedentes === 'string') {
    try {
      antecedentes = JSON.parse(antecedentes);
    } catch {
      antecedentes = {};
    }
  }

  const antecedentesTexto =
    Object.entries(antecedentes)
      .filter(([_, val]) => val)
      .map(([key]) => key)
      .join(', ') || 'Ninguno';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ficha del Paciente</Text>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.patientHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{paciente.nombre ? paciente.nombre.charAt(0) : '?'}</Text>
          </View>
          <Text style={styles.patientName}>{paciente.nombre || 'Nombre no registrado'}</Text>
          <Text style={styles.patientAge}>{paciente.edad ? `${paciente.edad} años` : 'Edad no registrada'}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Información Personal</Text>
          </View>

          <View style={styles.infoCard}>
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
                <Ionicons name="location-outline" size={18} color="#4D96FF" style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Lugar de Nacimiento:</Text>
              </View>
              <Text style={styles.infoValue}>{paciente.lugarNacimiento || 'No registrado'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Ionicons name="heart-outline" size={18} color="#4D96FF" style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Estado Civil:</Text>
              </View>
              <Text style={styles.infoValue}>{paciente.estadoCivil || 'No registrado'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Información Social</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Ionicons name="medkit-outline" size={18} color="#4D96FF" style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Cuidador Principal:</Text>
              </View>
              <Text style={styles.infoValue}>{paciente.cuidador || 'No registrado'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Ionicons name="school-outline" size={18} color="#4D96FF" style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Escolaridad:</Text>
              </View>
              <Text style={styles.infoValue}>{paciente.escolaridad || 'No registrado'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Ionicons name="briefcase-outline" size={18} color="#4D96FF" style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Ocupación Actual:</Text>
              </View>
              <Text style={styles.infoValue}>{paciente.ocupacion || 'No registrado'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="fitness" size={22} color="#0A2463" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Información Médica</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Ionicons name="medical-outline" size={18} color="#4D96FF" style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Enfermedades:</Text>
              </View>
              <Text style={styles.infoValue}>{paciente.enfermedades || 'No registrado'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Ionicons name="clipboard-outline" size={18} color="#4D96FF" style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Antecedentes:</Text>
              </View>
              <Text style={styles.infoValue}>{antecedentesTexto}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              console.log('pacienteId:', paciente.id, 'pacienteNombre:', paciente.nombre);
              navigation.navigate('PantallaPruebas', {
                pacienteId: paciente.id,
                pacienteNombre: paciente.nombre,
              });
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="clipboard-outline" size={22} color="#fff" style={styles.actionButtonIcon} />
            <Text style={styles.actionButtonText}>Ir a Pruebas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.historyButton]}
            onPress={() =>
              navigation.navigate('PantallaHistorialPruebas', {
                pacienteId: paciente.id,
                pacienteNombre: paciente.nombre,
              })
            }
            activeOpacity={0.8}
          >
            <Ionicons name="time-outline" size={22} color="#fff" style={styles.actionButtonIcon} />
            <Text style={styles.actionButtonText}>Ver Historial de Pruebas</Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={[styles.actionButton, styles.backButton]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back-outline" size={22} color="#4B5563" style={styles.actionButtonIcon} />
            <Text style={[styles.actionButtonText, styles.backButtonText]}>Volver</Text>
          </TouchableOpacity>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  patientHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4D96FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A2463',
    marginBottom: 4,
  },
  patientAge: {
    fontSize: 18,
    color: '#4B5563',
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2463',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#4D96FF',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyButton: {
    backgroundColor: '#10B981',
  },
  editButton: {
    backgroundColor: '#F59E0B',
  },
  backButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonText: {
    color: '#4B5563',
  },
});

export default PantallaVerPaciente;
