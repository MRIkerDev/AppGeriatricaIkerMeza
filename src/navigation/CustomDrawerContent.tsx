import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const [doctorNombre, setDoctorNombre] = useState('');
  const [doctorCorreo, setDoctorCorreo] = useState('');

  useEffect(() => {
    const cargarDatosDoctor = async () => {
      try {
        const nombre = await AsyncStorage.getItem('doctor_nombre');
        const correo = await AsyncStorage.getItem('doctor_correo');
        if (nombre) {setDoctorNombre(nombre);}
        if (correo) {setDoctorCorreo(correo);}
      } catch (error) {
        console.log('Error al cargar datos del doctor:', error);
      }
    };

    cargarDatosDoctor();
  }, []);


  const menuItems = {
    principal: ['Inicio'],
    pacientes: ['Agregar Paciente'],
    citas: ['Mis Citas'],
    utilidades: ['Ubicacion', 'Clima', 'Video Informativo'],
    cuenta: ['Cerrar Sesión'],
  };

  const isRouteActive = (routeName: string) => {
    const currentRoute = props.state.routes[props.state.index].name;
    return currentRoute === routeName;
  };
  const renderMenuItem = (routeName: string) => {
    const route = props.state.routes.find((r) => r.name === routeName);
    if (!route) {return null;}

    const { options } = props.descriptors[route.key];
    const label = options.title || routeName;
    const isActive = isRouteActive(routeName);

    let icon = null;
    if (options.drawerIcon) {
      icon = options.drawerIcon({
        color: isActive ? '#4D96FF' : '#6B7280',
        size: 22,
        focused: isActive,
      });
    }

    return (
      <TouchableOpacity
        key={routeName}
        style={[styles.menuItem, isActive && styles.activeMenuItem]}
        onPress={() => {
          if (routeName === 'Inicio') {
            props.navigation.dispatch(
              CommonActions.navigate({
                name: 'Inicio',
                params: { screen: 'PantallaPrincipal' },
              })
            );
          } else if (routeName === 'Cerrar Sesión') {
            props.navigation.reset({
              index: 0,
              routes: [{ name: 'Cerrar Sesión' }],
            });
          } else {
            props.navigation.reset({
              index: 0,
              routes: [{ name: routeName }],
            });
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemContent}>
          {icon}
          <Text style={[styles.menuItemText, isActive && styles.activeMenuItemText]}>{label}</Text>
        </View>
        {isActive && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    );
  };

  const renderMenuGroup = (title: string, items: string[]) => {
    const validItems = items.filter((item) => props.state.routes.some((r) => r.name === item));
    if (validItems.length === 0) {return null;}

    return (
      <View style={styles.menuGroup}>
        <Text style={styles.menuGroupTitle}>{title}</Text>
        {validItems.map(renderMenuItem)}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{doctorNombre ? doctorNombre.charAt(0) : 'D'}</Text>
        </View>
        <Text style={styles.doctorName}>{doctorNombre || 'Doctor'}</Text>
        <Text style={styles.doctorEmail}>{doctorCorreo || 'correo@ejemplo.com'}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderMenuGroup('Principal', menuItems.principal)}
        {renderMenuGroup('Pacientes', menuItems.pacientes)}
        {renderMenuGroup('Gestión de Citas', menuItems.citas)}
        {renderMenuGroup('Utilidades', menuItems.utilidades)}
        {renderMenuGroup('Cuenta', menuItems.cuenta)}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>App Geriátrica v1.0</Text>
      </View>
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
    paddingVertical: 30,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomRightRadius: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  doctorEmail: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  scrollView: {
    flex: 1,
    paddingTop: 16,
  },
  menuGroup: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  menuGroupTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    paddingLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 2,
  },
  activeMenuItem: {
    backgroundColor: '#EFF6FF',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  activeMenuItemText: {
    color: '#4D96FF',
    fontWeight: '600',
  },
  activeIndicator: {
    width: 4,
    height: 20,
    backgroundColor: '#4D96FF',
    borderRadius: 2,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default CustomDrawerContent;
