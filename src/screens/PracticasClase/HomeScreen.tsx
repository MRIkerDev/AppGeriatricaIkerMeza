import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Pantalla Principal (HomeScreen)
function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Inicio</Text>
      <Button 
        title="Ir a Detalles" 
        onPress={() => navigation.navigate('DetailScreen')} // Navega a la pantalla de detalles
      />
    </View>
  );
}

// Pantalla de Detalles (DetailScreen)
function DetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Detalles</Text>
    </View>
  );
}

// Crear el Drawer Navigator
const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Inicio">
        <Drawer.Screen name="Inicio" component={HomeScreen} />
        <Drawer.Screen name="Detalles" component={DetailScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

// Estilos para las pantallas
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    marginBottom: 10,
  },
});
