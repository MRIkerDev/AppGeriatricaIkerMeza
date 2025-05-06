import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, Button, FlatList, StyleSheet, Alert,
} from 'react-native';
import SQLite, { SQLiteDatabase, ResultSet } from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

type Alumno = {
  id: number;
  nombre: string;
  control: string;
  carrera: string;
};

export default function PruebaBaseDatosSQLite() {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [nombre, setNombre] = useState('');
  const [control, setControl] = useState('');
  const [carrera, setCarrera] = useState('');
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [idEditar, setIdEditar] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const leerAlumnos = useCallback(() => {
    db?.executeSql('SELECT * FROM alumnos;').then(([result]: [ResultSet]) => {
      const rows = result.rows;
      const data: Alumno[] = [];
      for (let i = 0; i < rows.length; i++) {
        data.push(rows.item(i));
      }
      setAlumnos(data);
    });
  }, [db]);

  useEffect(() => {
    SQLite.openDatabase({ name: 'Escuela.db', location: 'default' })
      .then((database: SQLiteDatabase) => {
        setDb(database);
        return database.executeSql(`
          CREATE TABLE IF NOT EXISTS alumnos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            control TEXT,
            carrera TEXT
          );
        `);
      })
      .then(() => leerAlumnos())
      .catch((error: unknown) => console.error('Error al abrir BD', error));
  }, [leerAlumnos]);

  const insertarAlumno = () => {
    if (!nombre || !control || !carrera) {
      Alert.alert('Campos vacíos', 'Por favor completa todos los campos.');
      return;
    }

    db?.executeSql(
      'INSERT INTO alumnos (nombre, control, carrera) VALUES (?, ?, ?);',
      [nombre, control, carrera]
    ).then(() => {
      limpiarFormulario();
      leerAlumnos();
    });
  };

  const eliminarAlumno = (id: number) => {
    db?.executeSql('DELETE FROM alumnos WHERE id = ?;', [id]).then(() => {
      leerAlumnos();
    });
  };

  const prepararEdicion = (alumno: Alumno) => {
    setNombre(alumno.nombre);
    setControl(alumno.control);
    setCarrera(alumno.carrera);
    setIdEditar(alumno.id);
  };

  const actualizarAlumno = () => {
    if (idEditar === null) {return;}

    db?.executeSql(
      'UPDATE alumnos SET nombre = ?, control = ?, carrera = ? WHERE id = ?;',
      [nombre, control, carrera, idEditar]
    ).then(() => {
      limpiarFormulario();
      leerAlumnos();
    });
  };

  const limpiarFormulario = () => {
    setNombre('');
    setControl('');
    setCarrera('');
    setIdEditar(null);
  };

  const buscarPorNombre = () => {
    if (!busqueda.trim()) {
      leerAlumnos();
      return;
    }

    db?.executeSql(
      'SELECT * FROM alumnos WHERE nombre LIKE ?;',
      [`%${busqueda}%`]
    ).then(([result]: [ResultSet]) => {
      const data: Alumno[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        data.push(result.rows.item(i));
      }
      setAlumnos(data);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📚 CRUD de alumnos</Text>

      <TextInput
        placeholder="Buscar por nombre"
        value={busqueda}
        onChangeText={setBusqueda}
        style={styles.input}
      />
      <Button title="Buscar" onPress={buscarPorNombre} />

      <TextInput
        placeholder="Nombre completo"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />
      <TextInput
        placeholder="Número de control"
        value={control}
        onChangeText={setControl}
        style={styles.input}
      />
      <TextInput
        placeholder="Carrera"
        value={carrera}
        onChangeText={setCarrera}
        style={styles.input}
      />

      <Button
        title={idEditar ? 'Actualizar Alumno' : 'Agregar Alumno'}
        onPress={idEditar ? actualizarAlumno : insertarAlumno}
      />

      <FlatList
        data={alumnos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.alumno}>
            <Text>👤 {item.nombre}</Text>
            <Text>{item.control} – {item.carrera}</Text>
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
