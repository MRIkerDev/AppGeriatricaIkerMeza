import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import PantallaPrincipal from '../screens/PantallaPrincipal';
import PantallaAgregarPaciente from '../screens/PantallaAgregarPaciente';
import PantallaPruebaCognitivaFluencia from '../screens/PantallaPruebaCognitivaFluencia';
import PruebaComponentes from '../screens/PruebaComponentes';
import Home from '../screens/Home';
import Second from '../screens/Segunda';

const Stack = createStackNavigator();//

const AppNavigator = () => {
  return (  
    <NavigationContainer>
      <Stack.Navigator initialRouteName="PantallaPrincipal">  
        <Stack.Screen name="PantallaPrincipal" component={PantallaPrincipal} />
        <Stack.Screen name="PantallaAgregarPaciente" component={PantallaAgregarPaciente} />
        <Stack.Screen name="PantallaPruebaCognitivaFluencia" component={PantallaPruebaCognitivaFluencia} />

        <Stack.Screen name="PruebaComponentes" component={PruebaComponentes} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Second" component={Second} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
