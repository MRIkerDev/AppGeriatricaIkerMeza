import React, { useState , useCallback} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert  } from 'react-native';
import { cargarPacientes,eliminarPaciente } from '../../database/database';
import { eliminarPacienteFirebase } from '../../utils/firebaseService';
import { hayInternet } from '../../utils/checarInternet';
import { guardarEliminacionPendiente } from '../../database/database';

const PantallaPrincipal = ({ navigation, route }: any) => {
  const [pacientes, setPacientes] = useState<any[]>([]);


  useFocusEffect(
    useCallback(() => {
      const cargarDatos = async () => {
        try {
          const pacientesCargados = await cargarPacientes();
          setPacientes(pacientesCargados);
        } catch (error) {
          console.log('Error al cargar pacientes:', error);
        }
      };

      cargarDatos();

      const nuevo = route.params?.nuevoPaciente;
      const actualizado = route.params?.pacienteActualizado;

      if (nuevo) {
        setPacientes((prev) => {
          const yaExiste = prev.some(
            (p) => p.id === nuevo.id
          );
          if (yaExiste) {return prev;}
          return [...prev, { ...nuevo, id: nuevo.id.toString() }];
        });
      }

      if (actualizado) {
        setPacientes((prev) =>
          prev.map((p) => (p.id === actualizado.id ? { ...actualizado } : p))
        );
      }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // importante: sin dependencias, para que se ejecute siempre al volver
  );

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
              setPacientes((prev) => prev.filter((p) => p.id !== pacienteId));
              if (tieneInternet) {
                await eliminarPacienteFirebase(pacienteId);//ELIMINAR EN FIREBASE
              } else {
                await guardarEliminacionPendiente(pacienteId);//GUARDAR EN TABLA ELIMINACIONES PENDIENTES
                console.log('Guardado como eliminación pendiente');
              }
            } catch (error) {
              console.log('Error al eliminar paciente:', error);
            }
          },
        },
      ]);
    };

    return (
      <View style={styles.container}>

        <Text style={styles.title}>Lista de Pacientes</Text>
        <FlatList
          data={pacientes}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <TouchableOpacity
              onPress={() =>
                navigation.navigate('PantallaVerPaciente', {
                  paciente: item,
                })
              }
              >
                <Text style={styles.itemText}>{item.nombre}</Text>
                <Text style={styles.itemSubText}>Edad: {item.edad}</Text>
                <Text style={styles.itemSubText}>Fecha Nac.: {item.fechaNacimiento}</Text>
              </TouchableOpacity>

              <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.button} onPress={() => editar(item)}>
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => eliminar(item.id)}>
                  <Text style={styles.buttonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay pacientes registrados aún.</Text>}
        />
      </View>
    );
  };


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8f8f8',
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#4a90e2',
      marginBottom: 20,
      textAlign: 'center',
    },
    item: {
      backgroundColor: '#fff',
      padding: 15,
      marginBottom: 10,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    itemText: {
      fontSize: 18,
      color: '#333',
    },
    itemSubText: {
      fontSize: 14,
      color: '#666',
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    button: {
      backgroundColor: '#4a90e2',
      padding: 8,
      borderRadius: 5,
    },
    buttonText: {
      color: '#fff',
      fontSize: 14,
    },
    emptyText: {
      textAlign: 'center',
      color: '#aaa',
      fontSize: 16,
      marginTop: 50,
    },
  });

  export default PantallaPrincipal;
