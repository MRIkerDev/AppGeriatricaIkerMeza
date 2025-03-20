/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import CheckBox from '@react-native-community/checkbox';

const PantallaAgregarPaciente = ({ navigation }: any) => {
    const [nombre, setNombre] = useState('');
    const [edad, setEdad] = useState('');
    const [enfermedades, setEnfermedades] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [lugarNacimiento, setLugarNacimiento] = useState('');
    const [estadoCivil, setEstadoCivil] = useState('');
    const [cuidadorPrincipal, setCuidadorPrincipal] = useState('');
    const [escolaridad, setEscolaridad] = useState('');
    const [ocupacionActual, setOcupacionActual] = useState('');
    const [tabaquismo, setTabaquismo] = useState(false);
    const [alcoholismo, setAlcoholismo] = useState(false);
    const [biomasa, setBiomasa] = useState(false);
    const [combe, setCombe] = useState(false);
    const [vacunas, setVacunas] = useState(false);
    const [cirugias, setCirugias] = useState(false);
    const [transfusiones, setTransfusiones] = useState(false);
    const [fracturas, setFracturas] = useState(false);
    const [alergias, setAlergias] = useState(false);
    const [formVisible, setFormVisible] = useState(true);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Registro de Pacientes</Text>
            {formVisible && (
                <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.label}>Nombre Completo:</Text>
                    <TextInput
                        style={styles.input}
                        value={nombre}
                        onChangeText={setNombre}
                        placeholder="Ingrese el nombre"
                    />
                    <Text style={styles.label}>Edad:</Text>
                    <TextInput
                        style={styles.input}
                        value={edad}
                        onChangeText={setEdad}
                        placeholder="Ingrese la edad"
                        keyboardType="numeric"
                    />
                    <Text style={styles.label}>Fecha de Nacimiento:</Text>
                    <TextInput
                        style={styles.input}
                        value={fechaNacimiento}
                        onChangeText={setFechaNacimiento}
                        placeholder="Ingrese la fecha de Nacimiento"
                    />
                    <Text style={styles.label}>Lugar de Nacimiento:</Text>
                    <TextInput
                        style={styles.input}
                        value={lugarNacimiento}
                        onChangeText={setLugarNacimiento}
                        placeholder="Ingrese el Lugar de Nacimiento"
                    />
                    <Text style={styles.label}>Estado Civil:</Text>
                    <TextInput
                        style={styles.input}
                        value={estadoCivil}
                        onChangeText={setEstadoCivil}
                        placeholder="Ingrese el Estado Civil"
                    />
                    <Text style={styles.label}>Cuidador principal:</Text>
                    <TextInput
                        style={styles.input}
                        value={cuidadorPrincipal}
                        onChangeText={setCuidadorPrincipal}
                        placeholder="Ingrese el nombre del cuidador"
                    />
                    <Text style={styles.label}>Escolaridad:</Text>
                    <TextInput
                        style={styles.input}
                        value={escolaridad}
                        onChangeText={setEscolaridad}
                        placeholder="Ingrese la escolaridad"
                    />
                    <Text style={styles.label}>Ocupación:</Text>
                    <TextInput
                        style={styles.input}
                        value={ocupacionActual}
                        onChangeText={setOcupacionActual}
                        placeholder="Ingrese la ocupación actual"
                    />
                    <Text style={styles.label}>Antecedentes Personales No Patologicos:</Text>
                    <View style={styles.checkboxContainer}>
                        <View style={styles.checkboxItem}>
                            <CheckBox value={tabaquismo} onValueChange={setTabaquismo} />
                            <Text style={styles.checkboxLabel}>Tabaquismo</Text>
                        </View>
                        <View style={styles.checkboxItem}>
                            <CheckBox value={alcoholismo} onValueChange={setAlcoholismo} />
                            <Text style={styles.checkboxLabel}>Alcoholismo</Text>
                        </View>
                        <View style={styles.checkboxItem}>
                            <CheckBox value={biomasa} onValueChange={setBiomasa} />
                            <Text style={styles.checkboxLabel}>Exposición a Biomasa</Text>
                        </View>
                        <View style={styles.checkboxItem}>
                            <CheckBox value={combe} onValueChange={setCombe} />
                            <Text style={styles.checkboxLabel}>Combe</Text>
                        </View>
                        <View style={styles.checkboxItem}>
                            <CheckBox value={vacunas} onValueChange={setVacunas} />
                            <Text style={styles.checkboxLabel}>Vacunas</Text>
                        </View>
                        <View style={styles.checkboxItem}>
                            <CheckBox value={cirugias} onValueChange={setCirugias} />
                            <Text style={styles.checkboxLabel}>Cirugías</Text>
                        </View>
                        <View style={styles.checkboxItem}>
                            <CheckBox value={transfusiones} onValueChange={setTransfusiones} />
                            <Text style={styles.checkboxLabel}>Transfusiones</Text>
                        </View>
                        <View style={styles.checkboxItem}>
                            <CheckBox value={fracturas} onValueChange={setFracturas} />
                            <Text style={styles.checkboxLabel}>Fracturas</Text>
                        </View>
                        <View style={styles.checkboxItem}>
                            <CheckBox value={alergias} onValueChange={setAlergias} />
                            <Text style={styles.checkboxLabel}>Alergias</Text>
                        </View>
                    </View>
                    <Text style={styles.label}>Enfermedades:</Text>
                    <TextInput
                        style={styles.input}
                        value={enfermedades}
                        onChangeText={setEnfermedades}
                        placeholder="Ingrese las enfermedades"
                    />
                    <Button title="Registrar Paciente" onPress={() => { navigation.navigate('PantallaPrincipal');}} />
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    title: {
        padding: 30,
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: 'purple',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: 'white',
    },
    checkboxContainer: {
        marginVertical: 10,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 16,
        color: '#333',
    },
});

export default PantallaAgregarPaciente;
