import React from 'react';
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