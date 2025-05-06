
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

const PantallaPruebas = ({ navigation, route }: any) => {
  const { total, pacienteId } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Pruebas</Text>
      <Button
  title="Regresar al inicio"
  onPress={() => navigation.navigate('PantallaPrincipal')}
/>
      {total !== undefined && (
        <Text style={styles.totalText}>Total de la prueba: {total}</Text>
      )}

      <ScrollView style={styles.scrollContainer}>
        {/* Cognitiva */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pruebas Cognitivas</Text>
          <Button
            title="Prueba Cognitiva Fluencia Verbal Semantica"
            onPress={() =>{console.log('Navegando a Fluencia con:', pacienteId);
              navigation.navigate('PantallaPruebaCognitivaFluencia', {
                pacienteId:pacienteId,
              });
            }}
          />
          <Button
            title="Prueba MiniCog"
            onPress={() => navigation.navigate('PantallaPruebaMiniCog', {
              pacienteId,
            })}
          />
          <Button
            title="Prueba MiniMental"
            onPress={() => navigation.navigate('PantallaPruebaMiniMental', {
              pacienteId,
            })}
          />
          <Button
            title="Prueba MOCA"
            onPress={() => navigation.navigate('PantallaPruebaMOCA', {
              pacienteId,
            })}
          />
        </View>

        {/* Afectiva */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pruebas Afectivas</Text>
          <Button
            title="Prueba CESD7"
            onPress={() => {console.log('ID del paciente en PantallaPruebas:', pacienteId); navigation.navigate('PantallaPruebaCESD7', {
              pacienteId,
            });}}
          />
          <Button
            title="Prueba GDS15"
            onPress={() => navigation.navigate('PantallaPruebaGDS15', {
              pacienteId,
            })}
          />
        </View>

        {/* Funcionamiento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pruebas de Funcionamiento</Text>
          <Button
            title="Prueba Evaluacion de Barrera"
            onPress={() => navigation.navigate('PantallaPruebaEvaBarrera', {
              pacienteId,
            })}
          />
          <Button
            title="Prueba Katz"
            onPress={() => navigation.navigate('PantallaPruebaKatz', {
              pacienteId,
            })}
          />
         <Button
            title="Prueba Visual"
            onPress={() => navigation.navigate('PantallaPruebaVisual', {
              pacienteId,
            })}
          />
          <Button
            title="Prueba Velocidad Sobre la Marcha"
            onPress={() => navigation.navigate('PantallaPruebaFuncionamiento', {
              pacienteId,

            })}
          />
        </View>

        {/* Nutricional */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pruebas Nutricionales</Text>
          <Button
            title="Prueba MNASF"
            onPress={() => navigation.navigate('PantallaPruebaMNASF', {
                pacienteId,
            })}
          />
          <Button
            title="Prueba MUST"
            onPress={() => navigation.navigate('PantallaPruebaMUST', {
              pacienteId,
            })}
          />
           <Button
            title="Prueba SARCF"
            onPress={() => navigation.navigate('PantallaPruebaSARCF', {
              pacienteId,
            })}
          />
        </View>

        {/*  Entorno */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pruebas de Entorno</Text>
          <Button
            title="Prueba Maltrato"
            onPress={() => navigation.navigate('PantallaPruebaMaltrato', {
              pacienteId,
            })}
          />
           <Button
            title="Prueba OARS"
            onPress={() => navigation.navigate('PantallaPruebaOARS', {
              pacienteId,
            })}
          />


        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: 'purple' },
  totalText: { fontSize: 20, color: 'green', marginTop: 10, textAlign: 'center' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: 'purple' },
  scrollContainer: { flex: 1 },
});

export default PantallaPruebas;
