import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import IonIcons from 'react-native-vector-icons/Ionicons';

//Pantallas Menu Lateral
import PantallaInicioApp from '../screens/MenuLateral/PantallaInicioApp';
import PantallaPrincipal from '../screens/MenuLateral/PantallaPrincipal';
import PantallaAgregarPaciente from '../screens/MenuLateral/PantallaAgregarPaciente';
import PantallaPruebas from '../screens/MenuLateral/PantallaPruebas';
import PantallaUbicacion from '../screens/MenuLateral/PantallaUbicacion';
import PantallaClima from '../screens/MenuLateral/PantallaClima';
import PantallaVideo from '../screens/MenuLateral/PantallaVideo';

//Pantallas de Practicas
import PruebaBaseDatosSQLite from '../screens/PracticasClase/PruebaBaseDatosSQLite';
import PruebaBaseDatosFirebase from '../screens/PracticasClase/PruebaBaseDatosFirebase';

//Pruebas Cognitivas
import PantallaPruebaCognitivaFluencia from '../screens/Pruebas/Cognitivas/PantallaPruebaCognitivaFluencia';
import PantallaPruebaMiniCog from '../screens/Pruebas/Cognitivas/PantallaPruebaMiniCog';
import PantallaPruebaMiniMental from '../screens/Pruebas/Cognitivas/PantallaPruebaMiniMental';
import PantallaPruebaMOCA from '../screens/Pruebas/Cognitivas/PantallaPruebaMOCA';

//Pruebas Afectivas
import PantallaPruebaCESD7 from '../screens/Pruebas/Afectivas/PantallaPruebaCESD7';
import PantallaPruebaGDS15 from '../screens/Pruebas/Afectivas/PantallaPruebaGDS15';

//Pruebas Funcionamiento
import PantallaPruebaEvaBarrera from '../screens/Pruebas/Funcionamiento/PantallaPruebaEvaBarrera';
import PantallaPruebaKatz from '../screens/Pruebas/Funcionamiento/PantallaPruebaKatz';
import PantallaPruebaVisual from '../screens/Pruebas/Funcionamiento/PantallaPruebaVisual';
import PantallaPruebaFuncionamiento from '../screens/Pruebas/Funcionamiento/PantallaPruebaFuncionamiento';

//Pruebas Nutricionales
import PantallaPruebaMNASF from '../screens/Pruebas/Nutricionales/PantallaPruebaMNASF';
import PantallaPruebaMUST from '../screens/Pruebas/Nutricionales/PantallaPruebaMUST';
import PantallaPruebaSARCF from '../screens/Pruebas/Nutricionales/PantallaPruebaSARCF';

//Pruebas Entorno
import PantallaPruebaMaltrato from '../screens/Pruebas/Entorno/PantallaPruebaMaltrato';
import PantallaPruebaOARS from '../screens/Pruebas/Entorno/PantallaPruebaOARS';













const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="PantallaPruebas">
      <Stack.Screen name="PantallaPrincipal" component={PantallaPrincipal} />
      <Stack.Screen name="PantallaAgregarPaciente" component={PantallaAgregarPaciente} />
      <Stack.Screen name="PantallaInicioApp" component={PantallaInicioApp} />
      <Stack.Screen name="PantallaPruebas" component={PantallaPruebas} />
      <Stack.Screen name="PantallaUbicacion" component={PantallaUbicacion} />
      <Stack.Screen name="PantallaClima" component={PantallaClima} />
      <Stack.Screen name="PantallaPruebaCognitivaFluencia" component={PantallaPruebaCognitivaFluencia} />
      <Stack.Screen name="PantallaPruebaCESD7" component={PantallaPruebaCESD7} />
      <Stack.Screen name="PantallaPruebaEvaBarrera" component={PantallaPruebaEvaBarrera} />
      <Stack.Screen name="PantallaPruebaFuncionamiento" component={PantallaPruebaFuncionamiento} />
      <Stack.Screen name="PantallaPruebaKatz" component={PantallaPruebaKatz} />
      <Stack.Screen name="PantallaPruebaMaltrato" component={PantallaPruebaMaltrato} />
      <Stack.Screen name="PantallaPruebaMiniCog" component={PantallaPruebaMiniCog} />
      <Stack.Screen name="PantallaPruebaMiniMental" component={PantallaPruebaMiniMental} />
      <Stack.Screen name="PantallaPruebaMNASF" component={PantallaPruebaMNASF} />
      <Stack.Screen name="PantallaPruebaMOCA" component={PantallaPruebaMOCA} />
      <Stack.Screen name="PantallaPruebaMUST" component={PantallaPruebaMUST} />
      <Stack.Screen name="PantallaPruebaOARS" component={PantallaPruebaOARS} />
      <Stack.Screen name="PantallaPruebaSARCF" component={PantallaPruebaSARCF} />
      <Stack.Screen name="PantallaPruebaVisual" component={PantallaPruebaVisual} />
      <Stack.Screen name="PantallaPruebaGDS15" component={PantallaPruebaGDS15} />
    </Stack.Navigator>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerPosition: 'left',
        headerShown: true,
      }}
    >
       <Drawer.Screen
        name=" "
        component={PantallaInicioApp}
      />
      <Drawer.Screen
        name="Inicio"
        component={PantallaPrincipal}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <IonIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Pruebas"
        component={StackNavigator}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <IonIcons name="apps" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Agregar Paciente"
        component={PantallaAgregarPaciente}
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <IonIcons name="person-add" color={color} size={size} />
          ),
        }}
      />

    <Drawer.Screen
            name="Ubicacion"
            component={PantallaUbicacion}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <IonIcons name="person-add" color={color} size={size} />
              ),
            }}
          />

          <Drawer.Screen
            name="Clima"
            component={PantallaClima}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <IonIcons name="person-add" color={color} size={size} />
              ),
            }}
          />

          <Drawer.Screen
            name="Prueba Base de Datos"
            component={PruebaBaseDatosSQLite}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <IonIcons name="person-add" color={color} size={size} />
              ),
            }}
          />


            <Drawer.Screen
            name="Prueba Base de Datos Firebase"
            component={PruebaBaseDatosFirebase}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <IonIcons name="person-add" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="Video"
            component={PantallaVideo}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <IonIcons name="person-add" color={color} size={size} />
              ),
            }}
          />
        </Drawer.Navigator>

      );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <DrawerNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
