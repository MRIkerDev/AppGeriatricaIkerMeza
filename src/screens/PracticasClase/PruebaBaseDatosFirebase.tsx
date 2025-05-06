import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { db } from '../../../firebaseConfig';
import { ref, push, onValue, remove, update } from 'firebase/database';


interface Alumno {
  id: string;
  nombre: string;
  control: string;
  carrera: string;
}

export default function PruebaBaseDatosFirebase() {
  const [nombre, setNombre] = useState('');
  const [control, setControl] = useState('');
  const [carrera, setCarrera] = useState('');
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  // Leer alumnos en tiempo real
  useEffect(() => {
    const alumnosRef = ref(db, 'alumnos/');
    onValue(alumnosRef, (snapshot) => {
      const data = snapshot.val();
      const lista: Alumno[] = data
        ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
        : [];
      setAlumnos(lista);
    });

    return () => {

    };
  }, []);

  const limpiar = () => {
    setNombre('');
    setControl('');
    setCarrera('');
    setEditandoId(null);
  };

  const guardarAlumno = () => {
    if (!nombre || !control || !carrera) {
      Alert.alert('Campos obligatorios');
      return;
    }

    const nuevoAlumno = { nombre, control, carrera };
    const alumnosRef = ref(db, 'alumnos/');
    console.log('Guardando en Firebase:', nuevoAlumno);

    if (editandoId) {
      update(ref(db, `alumnos/${editandoId}`), nuevoAlumno);
    } else {
      push(alumnosRef, nuevoAlumno);
    }

    limpiar();
  };

  const eliminarAlumno = (id: string) => {
    remove(ref(db, `alumnos/${id}`));
  };

  const prepararEdicion = (alumno: Alumno) => {
    setNombre(alumno.nombre);
    setControl(alumno.control);
    setCarrera(alumno.carrera);
    setEditandoId(alumno.id);
  };

  const buscarPorNombre = () => {
    const alumnosRef = ref(db, 'alumnos/');
    onValue(alumnosRef, (snapshot) => {
      const data = snapshot.val();
      const listaCompleta: Alumno[] = data
        ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
        : [];

      if (!busqueda.trim()) {
        setAlumnos(listaCompleta);
      } else {
        const resultado = listaCompleta.filter((a) =>
          a.nombre.toLowerCase().includes(busqueda.toLowerCase())
        );
        setAlumnos(resultado);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📚 CRUD de alumnos</Text>

      <TextInput
        placeholder="Buscar por nombre"
        style={styles.input}
        value={busqueda}
        onChangeText={setBusqueda}
      />
      <Button title="Buscar" onPress={buscarPorNombre} />

      <TextInput
        placeholder="Nombre"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        placeholder="No. Control"
        style={styles.input}
        value={control}
        onChangeText={setControl}
      />
      <TextInput
        placeholder="Carrera"
        style={styles.input}
        value={carrera}
        onChangeText={setCarrera}
      />
      <Button
        title={editandoId ? 'Actualizar Alumno' : 'Agregar Alumno'}
        onPress={guardarAlumno}
      />

      <FlatList
        data={alumnos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.alumno}>
            <Text style={{ fontWeight: 'bold' }}>{item.nombre}</Text>
            <Text>
              {item.control} – {item.carrera}
            </Text>
            <View style={styles.botones}>
              <Button title="✏️" onPress={() => prepararEdicion(item)} />
              <Button title="🗑️" color="red" onPress={() => eliminarAlumno(item.id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  titulo: { fontSize: 24, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  alumno: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  botones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
});
