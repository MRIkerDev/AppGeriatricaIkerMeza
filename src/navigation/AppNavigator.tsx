import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import PantallaPrincipal from '../screens/PantallaPrincipal';
import PantallaAgregarPaciente from '../screens/PantallaAgregarPaciente';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="PantallaPrincipal">  
        <Stack.Screen name="PantallaPrincipal" component={PantallaPrincipal} />
        <Stack.Screen name="PantallaAgregarPaciente" component={PantallaAgregarPaciente} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
