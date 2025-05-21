'use client';

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PantallaPruebas = ({ navigation, route }: any) => {
  const { total, pacienteId } = route.params || {};

  const pruebas = [
    {
      categoria: 'Pruebas Cognitivas',
      icon: 'brain',
      color: '#4D96FF',
      tests: [
        {
          nombre: 'Fluencia Verbal Semántica',
          ruta: 'PantallaPruebaCognitivaFluencia',
          icon: 'chatbubble-outline',
        },
        {
          nombre: 'MiniCog',
          ruta: 'PantallaPruebaMiniCog',
          icon: 'hourglass-outline',
        },
        {
          nombre: 'MiniMental',
          ruta: 'PantallaPruebaMiniMental',
          icon: 'clipboard-outline',
        },
        {
          nombre: 'MOCA',
          ruta: 'PantallaPruebaMOCA',
          icon: 'document-text-outline',
        },
      ],
    },
    {
      categoria: 'Pruebas Afectivas',
      icon: 'heart',
      color: '#F87171',
      tests: [
        {
          nombre: 'CESD7',
          ruta: 'PantallaPruebaCESD7',
          icon: 'happy-outline',
        },
        {
          nombre: 'GDS15',
          ruta: 'PantallaPruebaGDS15',
          icon: 'sad-outline',
        },
      ],
    },
    {
      categoria: 'Pruebas de Funcionamiento',
      icon: 'body',
      color: '#10B981',
      tests: [
        {
          nombre: 'Evaluación de Barrera',
          ruta: 'PantallaPruebaEvaBarrera',
          icon: 'analytics-outline',
        },
        {
          nombre: 'Katz',
          ruta: 'PantallaPruebaKatz',
          icon: 'fitness-outline',
        },
        {
          nombre: 'Visual',
          ruta: 'PantallaPruebaVisual',
          icon: 'eye-outline',
        },
        {
          nombre: 'Velocidad Sobre la Marcha',
          ruta: 'PantallaPruebaFuncionamiento',
          icon: 'walk-outline',
        },
      ],
    },
    {
      categoria: 'Pruebas Nutricionales',
      icon: 'nutrition',
      color: '#F59E0B',
      tests: [
        {
          nombre: 'MNASF',
          ruta: 'PantallaPruebaMNASF',
          icon: 'restaurant-outline',
        },
        {
          nombre: 'MUST',
          ruta: 'PantallaPruebaMUST',
          icon: 'scale-outline',
        },
        {
          nombre: 'SARCF',
          ruta: 'PantallaPruebaSARCF',
          icon: 'barbell-outline',
        },
      ],
    },
    {
      categoria: 'Pruebas de Entorno',
      icon: 'home',
      color: '#8B5CF6',
      tests: [
        {
          nombre: 'Maltrato',
          ruta: 'PantallaPruebaMaltrato',
          icon: 'alert-circle-outline',
        },
        {
          nombre: 'OARS',
          ruta: 'PantallaPruebaOARS',
          icon: 'people-outline',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pruebas Geriátricas</Text>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {total !== undefined && (
          <View style={styles.totalContainer}>
            <Ionicons name="calculator-outline" size={24} color="#10B981" style={styles.totalIcon} />
            <Text style={styles.totalText}>Total de la prueba: {total}</Text>
          </View>
        )}

        {pruebas.map((categoria, index) => (
          <View key={index} style={styles.categorySection}>
            <View style={[styles.categoryHeader, { backgroundColor: categoria.color }]}>
              <Ionicons name={categoria.icon} size={24} color="#fff" style={styles.categoryIcon} />
              <Text style={styles.categoryTitle}>{categoria.categoria}</Text>
            </View>

            <View style={styles.testsContainer}>
              {categoria.tests.map((test, testIndex) => (
                <TouchableOpacity
                  key={testIndex}
                  style={styles.testButton}
                  onPress={() => {
                    console.log(`Navegando a ${test.ruta} con:`, pacienteId);
                    navigation.navigate(test.ruta, {
                      pacienteId,
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.testIconContainer, { backgroundColor: categoria.color + '20' }]}>
                    <Ionicons name={test.icon} size={22} color={categoria.color} />
                  </View>
                  <Text style={styles.testButtonText}>{test.nombre}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('PantallaPrincipal')}
          activeOpacity={0.8}
        >
          <Ionicons name="home-outline" size={22} color="#4B5563" style={styles.backButtonIcon} />
          <Text style={styles.backButtonText}>Regresar al inicio</Text>
        </TouchableOpacity>
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
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  totalIcon: {
    marginRight: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
  categorySection: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryIcon: {
    marginRight: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  testsContainer: {
    backgroundColor: '#fff',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  testIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  testButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  backButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonIcon: {
    marginRight: 8,
  },
  backButtonText: {
    color: '#4B5563',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default PantallaPruebas;
