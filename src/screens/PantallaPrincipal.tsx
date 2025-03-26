import React, { useState } from 'react';
import { View, Text, Button, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const DATA = [
  { id: '1', title: 'Paciente Iker Meza' },
  { id: '2', title: 'Paciente 2' },
  { id: '3', title: 'Paciente 3' },
  { id: '4', title: 'Paciente 4' },
];

type ItemProps = { title: string };
const Item = ({ title }: ItemProps) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
);

const PantallaPrincipal = ({ navigation }: any) => {


  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Registro de Pacientes</Text>

      
          <Button title="Agregar Paciente" 
          onPress={() => { 
            navigation.navigate('PantallaAgregarPaciente');
          }} />
      

        <FlatList
          data={DATA}
          renderItem={({ item }) => <Item title={item.title} />}
          keyExtractor={item => item.id}
        />
           <Button title="Prueba Cognitiva Fluencia Verbal Semantica " 
          onPress={() => { 
            navigation.navigate('PantallaPruebaCognitivaFluencia');
          }} />
      </SafeAreaView>

    </SafeAreaProvider>
  );
};



const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { padding: 30, fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: 'purple' },
  item: { backgroundColor: '#f9c2ff', padding: 20, marginVertical: 8, marginHorizontal: 16 },
});

export default PantallaPrincipal;
