/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomDrawerContent from './CustomDrawerContent';
import AsyncStorage from '@react-native-async-storage/async-storage';
//Pantallas Menu Lateral
import PantallaPrincipal from '../screens/MenuLateral/PantallaPrincipal';
import PantallaAgregarPaciente from '../screens/MenuLateral/PantallaAgregarPaciente';
import PantallaMisCitas from '../screens/MenuLateral/PantallaMisCitas';
import PantallaUbicacion from '../screens/MenuLateral/PantallaUbicacion';
import PantallaClima from '../screens/MenuLateral/PantallaClima';
import PantallaVideo from '../screens/MenuLateral/PantallaVideo';
import PantallaCerrarSesion from '../screens/MenuLateral/PantallaCerrarSesion';

//Pantallas de Practicas
//import PruebaBaseDatosSQLite from '../screens/PracticasClase/PruebaBaseDatosSQLite';
//import PruebaBaseDatosFirebase from '../screens/PracticasClase/PruebaBaseDatosFirebase';
//import PantallaMultiAsyncStorage from '../screens/PracticasClase/PantallaMultiAsyncStorage';
//import PantallaAsyncStorage from '../screens/PracticasClase/PantallaAsyncStorage';
//import PantallaArchivoTexto from '../screens/PracticasClase/PantallaArchivoTexto';
//import PantallaPermisoCamara from '../screens/PracticasClase/PantallaPermisoCamara';
//import PantallaPermisosVisual from '../screens/PracticasClase/PantallaPermisosVisual';
//import PantallaPermisosCard from '../screens/PracticasClase/PantallaPermisosCard';
//import PantallaPedirPermisoCamara from '../screens/PracticasClase/PantallaPedirPermisoCamara';

//Pantallas
import PantallaInicioApp from '../screens/PantallaInicioApp';
import PantallaVerPaciente from '../screens/Paciente/PantallaVerPaciente';
import PantallaEditarPaciente from '../screens/Paciente/PantallaEditarPaciente';
import PantallaHistorialPruebas from '../screens/Pruebas/PantallaHistorialPruebas';
import PantallaInicioSesion from '../screens/Sesion/PantallaInicioSesion';
import PantallaVerCita from '../screens/Citas/PantallaVerCita';
import PantallaEditarCita from '../screens/Citas/PantallaEditarCita';
import PantallaCrearCita from '../screens/Citas/PantallaCrearCita';
import PantallaCrearReceta from '../screens/Receta/PantallaCrearReceta';
import PantallaEditarReceta from '../screens/Receta/PantallaEditarReceta';
import PantallaPruebas from '../screens/Pruebas/PantallaPruebas';
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
import { ActivityIndicator, View } from 'react-native';



const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();


const PrincipalNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="PantallaInicioApp">
      <Stack.Screen name="PantallaInicioApp" component={PantallaInicioApp} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaInicioSesion" component={PantallaInicioSesion} options={{ headerShown: false }} />
      <Stack.Screen name="PantallaAgregarPaciente" component={PantallaAgregarPaciente}options={{ headerShown: false }} />
      <Stack.Screen name="PantallaPrincipal" component={PantallaPrincipal}options={{ headerShown: false }} />
      <Stack.Screen name="PantallaClima" component={PantallaClima}options={{ headerShown: false }} />
      <Stack.Screen name="PantallaMisCitas" component={CitasNavigator}options={{ headerShown: false }} />
      <Stack.Screen name="PantallaVerPaciente" component={PantallaVerPaciente} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaCrearCita" component={PantallaCrearCita} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaEditarPaciente" component={PantallaEditarPaciente} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaCrearReceta" component={PantallaCrearReceta} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaEditarReceta" component={PantallaEditarReceta} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaHistorialPruebas" component={PantallaHistorialPruebas} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaPruebas" component={PantallaPruebas} options={{ headerShown: false }}/>
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
      <Stack.Screen name="PantallaPruebaMUST" component={PantallaPruebaMUST} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaPruebaOARS" component={PantallaPruebaOARS} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaPruebaSARCF" component={PantallaPruebaSARCF} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaPruebaVisual" component={PantallaPruebaVisual} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaPruebaGDS15" component={PantallaPruebaGDS15} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
};


const AgregarNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="PantallaAgregarPaciente">
      <Stack.Screen name="PantallaAgregarPaciente" component={PantallaAgregarPaciente}options={{ headerShown: false }} />
      <Stack.Screen name="PantallaPrincipal" component={PantallaPrincipal} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
};


const CitasNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="PantallaMisCitas">
      <Stack.Screen name="PantallaMisCitas" component={PantallaMisCitas} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaCrearCita" component={PantallaCrearCita} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaVerCita" component={PantallaVerCita} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaEditarCita" component={PantallaEditarCita} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaCrearReceta" component={PantallaCrearReceta} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaEditarReceta" component={PantallaEditarReceta} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
};


const CerrarSesionNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="PantallaCerrarSesion">
      <Stack.Screen name="PantallaCerrarSesion" component={PantallaCerrarSesion} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaInicioSesion" component={PantallaInicioSesion} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaPrincipal" component={DrawerNavigator} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
};
const InicioSesionNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="PantallaInicioSesion">
      <Stack.Screen name="PantallaInicioSesion" component={PantallaInicioSesion} options={{ headerShown: false }}/>
      <Stack.Screen name="PantallaPrincipal" component={DrawerNavigator} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
};




const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerPosition: 'left',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0A2463',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerActiveBackgroundColor: '#EFF6FF',
        drawerActiveTintColor: '#4D96FF',
        drawerInactiveTintColor: '#6B7280',
        drawerLabelStyle: {
          marginLeft: -20,
          fontSize: 16,
        },
      }}
    >
          <Drawer.Screen
          name="Inicio"
          component={PrincipalNavigator}
          listeners={({ navigation }) => ({
            drawerItemPress: (e) => {
              e.preventDefault();
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'Inicio',
                    state: {
                      index: 0,
                      routes: [
                        { name: 'PantallaPrincipal' },
                      ],
                    },
                  },
                ],
              });
            },
          })}
          options={{
            headerShown: true,
            title: 'Panel Principal',
            drawerIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
          }}
        />

      <Drawer.Screen
        name="Agregar Paciente"
        component={AgregarNavigator}
        listeners={({ navigation }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Agregar Paciente' }],
            });
          },
        })}
        options={{
          headerShown: true,
          title: 'Nuevo Paciente',
          drawerIcon: ({ color, size }) => <Ionicons name="person-add" color={color} size={size} />,
        }}
      />

      <Drawer.Screen
        name="Mis Citas"
        component={CitasNavigator}
        listeners={({ navigation }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Mis Citas' }],
            });
          },
        })}
        options={{
          headerShown: true,
          title: 'Gestión de Citas',
          drawerIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} />,
        }}
      />

      <Drawer.Screen
        name="Ubicacion"
        component={PantallaUbicacion}
        listeners={({ navigation }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Ubicacion' }],
            });
          },
        })}
        options={{
          title: 'Ubicación',
          drawerIcon: ({ color, size }) => <Ionicons name="location" color={color} size={size} />,
        }}
      />

      <Drawer.Screen
        name="Clima"
        component={PantallaClima}
        listeners={({ navigation }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Clima' }],
            });
          },
        })}
        options={{
          title: 'Pronóstico del Clima',
          drawerIcon: ({ color, size }) => <Ionicons name="partly-sunny" color={color} size={size} />,
        }}
      />

      <Drawer.Screen
        name="Video Informativo"
        component={PantallaVideo}
        listeners={({ navigation }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Video Informativo' }],
            });
          },
        })}
        options={{
          headerShown: true,
          title: 'Videos Informativos',
          drawerIcon: ({ color, size }) => <Ionicons name="videocam" color={color} size={size} />,
        }}
      />

      <Drawer.Screen
        name="Cerrar Sesión"
        component={CerrarSesionNavigator}
        listeners={({ navigation }) => ({
          drawerItemPress: (e) => {
            e.preventDefault();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Cerrar Sesión' }],
            });
          },
        })}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => <Ionicons name="log-out" color={color} size={size} />,
        }}
      />
    </Drawer.Navigator>
  );
};


const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const checkSession = async () => {
      try {
        const doctorId = await AsyncStorage.getItem('doctor_id');
        setIsLoggedIn(!!doctorId);
      } catch (error) {
        console.error('Error verificando sesión:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4D96FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={DrawerNavigator} />
        ) : (
          <Stack.Screen name="Login" component={InicioSesionNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
