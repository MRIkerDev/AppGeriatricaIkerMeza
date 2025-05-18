import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
import PantallaMultiAsyncStorage from '../screens/PracticasClase/PantallaMultiAsyncStorage';
import PantallaAsyncStorage from '../screens/PracticasClase/PantallaAsyncStorage';
import PantallaArchivoTexto from '../screens/PracticasClase/PantallaArchivoTexto';
import PantallaPermisoCamara from '../screens/PracticasClase/PantallaPermisoCamara';
import PantallaPermisosVisual from '../screens/PracticasClase/PantallaPermisosVisual';
import PantallaPermisosCard from '../screens/PracticasClase/PantallaPermisosCard';

//Pantallas
import PantallaVerPaciente from '../screens/PantallaVerPaciente';
import PantallaEditarPaciente from '../screens/PantallaEditarPaciente';
import PantallaHistorialPruebas from '../screens/PantallaHistorialPruebas';
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
import PantallaPedirPermisoCamara from '../screens/PracticasClase/PantallaPedirPermisoCamara';













const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();



const PrincipalNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="PantallaPrincipal">
      <Stack.Screen name="PantallaPrincipal" component={PantallaPrincipal} />
      <Stack.Screen name="PantallaVerPaciente" component={PantallaVerPaciente} options={{ headerShown: true }}/>
      <Stack.Screen name="PantallaEditarPaciente" component={PantallaEditarPaciente} options={{ headerShown: true }}/>
      <Stack.Screen name="PantallaHistorialPruebas" component={PantallaHistorialPruebas} options={{ headerShown: true }}/>
      <Stack.Screen name="PantallaPruebas" component={PantallaPruebas} options={{ headerShown: true }}/>
      <Stack.Screen name="PantallaPruebaCognitivaFluencia" component={PantallaPruebaCognitivaFluencia} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaPruebaCESD7" component={PantallaPruebaCESD7} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaPruebaEvaBarrera" component={PantallaPruebaEvaBarrera} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaPruebaFuncionamiento" component={PantallaPruebaFuncionamiento} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaPruebaKatz" component={PantallaPruebaKatz}  options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaPruebaMaltrato" component={PantallaPruebaMaltrato} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaPruebaMiniCog" component={PantallaPruebaMiniCog} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaPruebaMiniMental" component={PantallaPruebaMiniMental} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaPruebaMNASF" component={PantallaPruebaMNASF} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaPruebaMOCA" component={PantallaPruebaMOCA} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaPruebaMUST" component={PantallaPruebaMUST} />
      <Stack.Screen name="PantallaPruebaOARS" component={PantallaPruebaOARS} />
      <Stack.Screen name="PantallaPruebaSARCF" component={PantallaPruebaSARCF} />
      <Stack.Screen name="PantallaPruebaVisual" component={PantallaPruebaVisual} />
      <Stack.Screen name="PantallaPruebaGDS15" component={PantallaPruebaGDS15} />
    </Stack.Navigator>
  );
};
const AgregarNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="PantallaAgregarPaciente">
      <Stack.Screen name="PantallaAgregarPaciente" component={PantallaAgregarPaciente} />
      <Stack.Screen name="PantallaPrincipal" component={PantallaPrincipal} />
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
        component={PrincipalNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Agregar Paciente"
        component={AgregarNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-add" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Ubicacion"
        component={PantallaUbicacion}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="location" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Clima"
        component={PantallaClima}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cloud" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Video"
        component={PantallaVideo}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="videocam-outline" color={color} size={size} />
          ),
        }}
      />

          <Drawer.Screen
            name="Prueba Base de Datos"
            component={PruebaBaseDatosSQLite}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="videocam-outline" color={color} size={size} />
              ),
            }}
          />


            <Drawer.Screen
            name="Prueba Base de Datos Firebase"
            component={PruebaBaseDatosFirebase}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="videocam-outline" color={color} size={size} />
              ),
            }}
          />

          <Drawer.Screen
            name="Prueba Async Storage"
            component={PantallaAsyncStorage}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="videocam-outline" color={color} size={size} />
              ),
            }}
          />

          <Drawer.Screen
            name="Prueba Async Storage Multi"
            component={PantallaMultiAsyncStorage}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="videocam-outline" color={color} size={size} />
              ),
            }}
          />
           <Drawer.Screen
            name="Prueba Archivo Texto"
            component={PantallaArchivoTexto}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="videocam-outline" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="Prueba Permiso Camara"
            component={PantallaPermisoCamara}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="videocam-outline" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="Prueba Permiso Visual"
            component={PantallaPermisosVisual}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="home" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="Prueba Permiso Card"
            component={PantallaPermisosCard}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="home" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="Prueba Permiso Camara 2"
            component={PantallaPedirPermisoCamara}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              drawerIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="home" color={color} size={size} />
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
