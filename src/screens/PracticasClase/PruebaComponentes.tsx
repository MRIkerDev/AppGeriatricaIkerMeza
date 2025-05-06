/*import React from 'react';
import {StyleSheet, Text, View, SectionList, StatusBar} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

const DATA = [
  {
    title: 'Cognitiva',
    data: ['Fluencia Verbal Semantica', 'Mini-Cog', 'Mini-Mental'],
  },
  {
    title: 'Afectiva',
    data: ['GDS-15', 'CESD-7 Items'],
  },
  {
    title: 'Funcionamiento',
    data: ['Indice de Katz', 'Indice de Lawton', 'SPPB', 'FRAIL', 'Escala Braden', 'Escala Norton', 'Audicion','Vision'],
  },
  {
    title: 'Nutricional',
    data: ['MNA-SF', 'MUST', 'SARC-F'],
  },{
    title: 'Entorno',
    data: ['OARS', 'Escala geriatrica de maltrato', 'Movilidad en el entorno'],
  },
];

const App = () => (
  <SafeAreaProvider>
    <SafeAreaView style={styles.container} edges={['top']}>
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({item}) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item}</Text>
          </View>
        )}
        renderSectionHeader={({section: {title}}) => (
          <Text style={styles.header}>{title}</Text>
        )}
      />
    </SafeAreaView>
  </SafeAreaProvider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    marginHorizontal: 16,
  },
  item: {
    backgroundColor: 'orange',
    padding: 20,
    marginVertical: 8,
  },
  header: {
    fontSize: 32,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
  },
});

export default App;

*/
/*import React, { useRef } from 'react';
import { View, Text, StyleSheet, Button, DrawerLayoutAndroid } from 'react-native';

prueba 1
const App = () => {
 
  const drawer = useRef<DrawerLayoutAndroid | null>(null);

  
  const navigationView = (
    <View style={styles.drawerContainer}>
      <Text style={styles.drawerTitle}>Menú Lateral de Iker Meza</Text>
      <Button
        title="Cerrar menú lateral"
        onPress={() => drawer.current?.closeDrawer()} 
      />
    </View>
  );

  return (
    <DrawerLayoutAndroid
      ref={drawer}
      drawerWidth={250}
      drawerPosition="left"
      renderNavigationView={() => navigationView}
    >
      <View style={styles.container}>
        <Text style={styles.text}>Contenido principal</Text>
        <Button
          title="Abrir menú lateral"
          onPress={() => drawer.current?.openDrawer()} 
        />
      </View>
    </DrawerLayoutAndroid>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  drawerTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default App;
*/
/*
import React, { useRef, useState } from 'react';
import { Button, DrawerLayoutAndroid, Text, StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {

  const drawer = useRef<DrawerLayoutAndroid | null>(null);
  const [drawerPosition, setDrawerPosition] = useState<'left' | 'right'>('left');

  const changeDrawerPosition = () => {
    setDrawerPosition(prevPosition => (prevPosition === 'left' ? 'right' : 'left'));
  };

  const navigationView = () => (
    <SafeAreaView style={[styles.container, styles.navigationContainer]}>
      <Text style={styles.paragraph}>Estoy en el Drawer de iker meza!</Text>
      <Button
        title="Oculta el drawer"
        onPress={() => drawer.current?.closeDrawer()} 
      />
    </SafeAreaView>
  );

  return (
    <SafeAreaProvider>
      <DrawerLayoutAndroid
        ref={drawer}
        drawerWidth={200}
        drawerPosition={drawerPosition}
        renderNavigationView={navigationView}
      >
        <SafeAreaView style={styles.container}>
          <Text style={styles.paragraph}>El Drawer está en {drawerPosition}!</Text>
          <Button title="Cambia de Posición el Drawer" onPress={changeDrawerPosition} />
          <Text style={styles.paragraph}>
            ¡Desliza el dedo desde el margen o presiona el botón para verlo!
          </Text>
          <Button
            title="Muestra el drawer"
            onPress={() => drawer.current?.openDrawer()} 
          />
        </SafeAreaView>
      </DrawerLayoutAndroid>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  navigationContainer: {
    backgroundColor: '#F8BBD0',
  },
  paragraph: {
    padding: 16,
    fontSize: 15,
    textAlign: 'center',
  },
});

export default App;
*/
