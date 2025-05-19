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

//BUSCAR PACIENTES
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

//AGREGAR RESULTADO DEL PACIENTE
export const guardarResultado = async (
  pacienteId: number,
  nombrePrueba: string,
  resultado: number
) => {
  if (pacienteId == null) {
    console.warn('Intento de guardar resultado SIN pacienteId:', { pacienteId, nombrePrueba, resultado });
    return;
  }

  const database = await openDatabase();
  const fechaHoy = new Date().toISOString().split('T')[0];

  // Verifica si el resultado ya existe hoy
  const [existingResult] = await database.executeSql(
    'SELECT * FROM resultados WHERE pacienteId = ? AND nombrePrueba = ? AND fecha = ?',
    [pacienteId, nombrePrueba, fechaHoy]
  );

  if (existingResult.rows.length === 0) {
    await database.executeSql(
      'INSERT INTO resultados (pacienteId, nombrePrueba, puntaje, fecha, sincronizado) VALUES (?, ?, ?, ?, 0)',
      [pacienteId, nombrePrueba, resultado, new Date().toISOString()]
    );
    console.log('Resultado insertado localmente:', { pacienteId, nombrePrueba, resultado });
  } else {
    console.log('Resultado ya existe para hoy:', { pacienteId, nombrePrueba });
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

  



//database.ts PARA GUARDAR LOS QUE NO HAN SIDO SINCRONIZADOS
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
//ELIMINACIONES DE PACIENTE PENDIENTES
export const guardarEliminacionPendiente = async (pacienteId: number): Promise<void> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO eliminaciones_pendientes (pacienteId) VALUES (?)',
        [pacienteId],
        () => resolve(),
        (_, error) => {
          console.error('Error al registrar eliminación pendiente:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
export const obtenerEliminacionesPendientes = async (): Promise<number[]> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'SELECT pacienteId FROM eliminaciones_pendientes',
        [],
        (_, { rows }) => {
          const ids: number[] = [];

          for (let i = 0; i < rows.length; i++) {
            ids.push(parseInt(rows.item(i).pacienteId));
          }

          resolve(ids);
        },
        (_, error) => {
          console.error('Error al obtener eliminaciones pendientes:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};

export const eliminarEliminacionPendiente = async (pacienteId: number): Promise<void> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM eliminaciones_pendientes WHERE pacienteId = ?',
        [pacienteId],
        () => resolve(),
        (_, error) => {
          console.error('Error al eliminar eliminación pendiente:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
//EDICIONES DE PACIENTE PENDIENTES
export const guardarEdicionPendiente = async (pacienteId: number, nuevosDatos: any): Promise<void> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO ediciones_pendientes (pacienteId, nuevosDatos) VALUES (?, ?)',
        [pacienteId, JSON.stringify(nuevosDatos)],
        () => resolve(),
        (_, error) => {
          console.error('Error al registrar edición pendiente:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
export const obtenerEdicionesPendientes = async (): Promise<{ pacienteId: number, nuevosDatos: any }[]> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM ediciones_pendientes',
        [],
        (_, { rows }) => {
          const ediciones: { pacienteId: number, nuevosDatos: any }[] = [];

          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            ediciones.push({
              pacienteId: row.pacienteId,
              nuevosDatos: JSON.parse(row.nuevosDatos),
            });
          }

          resolve(ediciones);
        },
        (_, error) => {
          console.error('Error al obtener ediciones pendientes:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
export const eliminarEdicionPendiente = async (pacienteId: number): Promise<void> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM ediciones_pendientes WHERE pacienteId = ?',
        [pacienteId],
        () => resolve(),
        (_, error) => {
          console.error('Error al eliminar edición pendiente:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
//RESULTADOS PENDIENTES
export const marcarResultadoComoSincronizado = async (resultadoId: number): Promise<void> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `UPDATE resultados SET sincronizado = 1 WHERE id = ?`,
        [resultadoId],
        () => resolve(),
        (_, error) => {
          console.error('Error al marcar resultado como sincronizado:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
export const obtenerResultadosPendientes = async (): Promise<any[]> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM resultados WHERE sincronizado = 0`,
        [],
        (_, { rows }) => {
          const resultados: any[] = [];
          for (let i = 0; i < rows.length; i++) {
            resultados.push(rows.item(i));
          }
          resolve(resultados);
        },
        (_, error) => {
          console.error('Error al obtener resultados no sincronizados:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};