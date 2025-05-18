import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

let db: SQLite.SQLiteDatabase;

export const openDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabase({ name: 'pacientes.db', location: 'default' });
  }
  return db;
};

export const crearTablas = async () => {
  const database = await openDatabase();
//tabla pacientes
  await database.executeSql(
    `CREATE TABLE IF NOT EXISTS pacientes (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      edad INTEGER,
      fechaNacimiento TEXT,
      lugarNacimiento TEXT,
      estadoCivil TEXT,
      cuidador TEXT,
      escolaridad TEXT,
      ocupacion TEXT,
      enfermedades TEXT,
      antecedentes TEXT,
      sincronizado INTEGER DEFAULT 0
    );`
  );
//tabla resultados
  await database.executeSql(
    `CREATE TABLE IF NOT EXISTS resultados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pacienteId INT,
      nombrePrueba TEXT,
      puntaje REAL,
      fecha TEXT,
      sincronizado INTEGER DEFAULT 0,
      FOREIGN KEY (pacienteId) REFERENCES pacientes(id)
    );`
  );
//tabla eliminaciones pendientes
  await database.executeSql(
    `CREATE TABLE IF NOT EXISTS eliminaciones_pendientes (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       pacienteId TEXT
    );`
  );
//tabla ediciones pendientes
  await database.executeSql(
    `CREATE TABLE IF NOT EXISTS ediciones_pendientes (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       pacienteId INTEGER,
       nuevosDatos TEXT
    );`
  );

};

export interface Paciente {
  id: number;
  nombre: string;
  edad: number;
  fechaNacimiento: string;
  estadoCivil: string;
  cuidador: string;
  escolaridad: string;
  ocupacion: string;
  enfermedades: string;
    antecedentes: Record<string, boolean>;
  }


//AGREGAR PACIENTE
export const guardarPaciente = async (paciente: any): Promise<number> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO pacientes (
          nombre, edad, fechaNacimiento, lugarNacimiento, estadoCivil,
          cuidador, escolaridad, ocupacion, enfermedades, antecedentes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          paciente.nombre,
          parseInt(paciente.edad),
          paciente.fechaNacimiento,
          paciente.lugarNacimiento,
          paciente.estadoCivil,
          paciente.cuidador,
          paciente.escolaridad,
          paciente.ocupacion,
          paciente.enfermedades,
          JSON.stringify(paciente.antecedentes),
        ],
        (_, result) => {
          resolve(result.insertId); 
        },
        (_, error) => {
          console.log('Error al guardar paciente:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

//EDITAR PACIENTE
export const editarPaciente = (paciente: { id: any; nombre: any; edad: any; fechaNacimiento: any; lugarNacimiento: any; estadoCivil: any; cuidador: any; escolaridad: any; ocupacion: any; enfermedades: any; antecedentes: any; }) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE pacientes SET 
          nombre = ?, 
          edad = ?, 
          fechaNacimiento = ?, 
          lugarNacimiento = ?, 
          estadoCivil = ?, 
          cuidador = ?, 
          escolaridad = ?, 
          ocupacion = ?, 
          enfermedades = ?, 
          antecedentes = ?
         WHERE id = ?`,
        [
          paciente.nombre,
          paciente.edad,
          paciente.fechaNacimiento,
          paciente.lugarNacimiento,
          paciente.estadoCivil,
          paciente.cuidador,
          paciente.escolaridad,
          paciente.ocupacion,
          paciente.enfermedades,
          JSON.stringify(paciente.antecedentes), 
          paciente.id,
        ],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

//ELIMINAR PACIENTE
export const eliminarPaciente = (id: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const database = await openDatabase();
    database.transaction((tx) => {

      tx.executeSql(
        `DELETE FROM resultados WHERE pacienteId = ?`,
        [id],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_, result) => {
       
          tx.executeSql(
            `DELETE FROM pacientes WHERE id = ?`,
            [id],
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (_, result) => resolve(),
            (_, error) => {
              console.log('Error al eliminar paciente:', error);
              reject(error);
              return false;
            }
          );
        },
        (_, error) => {
          console.log('Error al eliminar resultados:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

//CARGAR PACIENTES
export const cargarPacientes = async (): Promise<any[]> => {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'SELECT id, nombre, edad, fechaNacimiento, lugarNacimiento, estadoCivil, cuidador, escolaridad, ocupacion, enfermedades, antecedentes FROM pacientes',
        [],
        (_, { rows }) => {
          const pacientes = rows.raw();
          resolve(pacientes);
        },
        // Error
        (_, error) => {
          console.log('Error al cargar pacientes:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

//AGREGAR RESULTADO
export const guardarResultado = async (pacienteId: number, nombrePrueba: string, resultado: number) => {
  const database = await openDatabase();

  // Verifica si el resultado ya existe
  const [existingResult] = await database.executeSql(
    'SELECT * FROM resultados WHERE pacienteId = ? AND nombrePrueba = ? AND fecha = ?',
    [pacienteId, nombrePrueba, new Date().toISOString().split('T')[0]]  // Solo verifica por fecha (puedes ajustar según necesites)
  );

  if (existingResult.rows.length === 0) {
    await database.executeSql(
      'INSERT INTO resultados (pacienteId, nombrePrueba, puntaje, fecha, sincronizado) VALUES (?, ?, ?, ?, 0)',
      [pacienteId, nombrePrueba, resultado, new Date().toISOString()]
    );
    console.log('Resultado insertado');
  } else {
    console.log('Resultado ya existe, no se insertó');
  }
};

//OBTENER RESULTADOS POR PACIENTE
export const obtenerResultadosPorPaciente = async (pacienteId: number) => {
  const database = await openDatabase();
  return new Promise<any[]>((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM resultados WHERE pacienteId = ? ORDER BY fecha DESC',
        [pacienteId],
        (_, { rows }) => {
          const resultados: any[] = [];
          for (let i = 0; i < rows.length; i++) {
            resultados.push(rows.item(i));
          }
          resolve(resultados);
        },
        (_, error) => {
          console.error('Error al obtener resultados:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

  



//buscar
export const obtenerPacientes = async () => {
  const database = await openDatabase();

  const [results] = await database.executeSql('SELECT * FROM pacientes');
  const pacientes = [];

  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    pacientes.push({
      ...row,
      antecedentes: JSON.parse(row.antecedentes || '{}'),
    });
  }

  return pacientes;
};

//database.ts
export const obtenerPacientesPendientes = async (): Promise<Paciente[]> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM pacientes WHERE sincronizado = 0',
        [],
        (_, { rows }) => {
          const pacientes: Paciente[] = [];

          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);

            pacientes.push({
              id: row.id,
              nombre: row.nombre,
              edad: row.edad,
              fechaNacimiento: row.fechaNacimiento,
              estadoCivil: row.estadoCivil,
              cuidador: row.cuidador,
              escolaridad: row.escolaridad,
              ocupacion: row.ocupacion,
              enfermedades: row.enfermedades,
              antecedentes: JSON.parse(row.antecedentes || '{}'),
            });
          }

          resolve(pacientes);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const guardarEliminacionPendiente = async (pacienteId: string) => {
  const database = await openDatabase();
  await database.executeSql(
    'INSERT INTO eliminaciones_pendientes (pacienteId) VALUES (?)',
    [pacienteId]
  );
};
export const guardarEdicionPendiente = async (pacienteId: number, nuevosDatos: any) => {
  const database = await openDatabase();
  await database.executeSql(
    'INSERT INTO ediciones_pendientes (pacienteId, nuevosDatos) VALUES (?, ?)',
    [pacienteId, JSON.stringify(nuevosDatos)]
  );
};

export const marcarPacienteComoSincronizado = async (id: number): Promise<void> => {
  const database = await openDatabase(); 

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'UPDATE pacientes SET sincronizado = 1 WHERE id = ?',
        [id],
        () => resolve(),
        (_, error) => {
          console.log('Error al marcar como sincronizado:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};