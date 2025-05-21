import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { agendarNotificacionCita } from '../utils/notificaciones';
SQLite.enablePromise(true);

let db: SQLite.SQLiteDatabase;

export const openDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabase({ name: 'pacientes.db', location: 'default' });
  }
  return db;
};
export const resetearBaseDeDatos = async () => {
  const db = await openDatabase();
  await AsyncStorage.multiRemove(['doctor_id', 'doctor_nombre', 'doctor_correo']);
  db.transaction((tx) => {
    tx.executeSql('DROP TABLE IF EXISTS CitasPacientes');
    tx.executeSql('DROP TABLE IF EXISTS ediciones_citas_pendientes');
    tx.executeSql('DROP TABLE IF EXISTS resultados');
    tx.executeSql('DROP TABLE IF EXISTS ediciones_pendientes');
    tx.executeSql('DROP TABLE IF EXISTS eliminaciones_pendientes');
    tx.executeSql('DROP TABLE IF EXISTS pacientes');
    tx.executeSql('DROP TABLE IF EXISTS doctores');
    tx.executeSql('DROP TABLE IF EXISTS recetas_pendientes');
    tx.executeSql('DROP TABLE IF EXISTS citas_pendientes');
    tx.executeSql('DROP TABLE IF EXISTS ediciones_citas_pendientes');
    tx.executeSql('DROP TABLE IF EXISTS eliminaciones_pendientes');
    tx.executeSql('DROP TABLE IF EXISTS ediciones_pendientes');
    tx.executeSql('DROP TABLE IF EXISTS recetas_pendientes');
    tx.executeSql('DROP TABLE IF EXISTS recetas');
    

  });
};
export const crearTablas = async () => {
  const database = await openDatabase();

  //tabla doctor
  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS doctores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      email TEXT,
      contrasena TEXT,
      sincronizado INTEGER DEFAULT 0
    );
  `);
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
      sincronizado INTEGER DEFAULT 0,
      doctorId INTEGER,
      FOREIGN KEY (doctorId) REFERENCES doctores(id)
    );`
  );

  //tabla citas
  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS CitasPacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      PacienteID INTEGER NOT NULL,
      DoctorID INTEGER NOT NULL,
      FechaHoraCita TEXT NOT NULL,
      EstadoCita TEXT DEFAULT 'pendiente',
      MotivoCita TEXT NOT NULL,
      NotasAdicionales TEXT,
      Diagnostico TEXT,
      Tratamiento TEXT,
      FechaCreacion TEXT DEFAULT (datetime('now')),
      sincronizado INTEGER DEFAULT 0,
      FOREIGN KEY (PacienteID) REFERENCES pacientes(id),
      FOREIGN KEY (DoctorID) REFERENCES doctores(id)
    );
  `);
  //tabla recetas
  await database.executeSql(`
   CREATE TABLE recetas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    CitaID INTEGER NOT NULL,
    PacienteID INTEGER NOT NULL,
    DoctorID INTEGER NOT NULL,
    FechaEmision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Medicamento TEXT NOT NULL,
    Dosis TEXT NOT NULL,
    ViaAdministracion TEXT,
    DuracionTratamiento TEXT,
    InstruccionesAdicionales TEXT,
    FirmaDigital TEXT, 
    sincronizado INTEGER DEFAULT 0,
    FOREIGN KEY (CitaID) REFERENCES CitasPacientes(id),
    FOREIGN KEY (PacienteID) REFERENCES pacientes(id),
    FOREIGN KEY (DoctorID) REFERENCES doctores(id)
);
  `);
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

  //tabla ediciones citas pendientes
  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS ediciones_citas_pendientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      citaId INTEGER,
      nuevosDatos TEXT
    );
  `);
//tabla recetas pendientes
  await database.executeSql(
    `CREATE TABLE IF NOT EXISTS recetas_pendientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recetaId INTEGER,
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

export interface Doctor {
  id: number;
  nombre: string;
  email: string;
  contrasena: string;
}

// AGREGAR DOCTOR Local con retorno de ID
export const guardarDoctor = async (doctor: {
  nombre: string;
  email: string;
  contrasena: string;
  }): Promise<number> => {
  const database = await openDatabase();
  
  return new Promise((resolve, reject) => {
  database.transaction((tx) => {
  tx.executeSql(
  `INSERT INTO doctores (nombre, email, contrasena, sincronizado) VALUES (?, ?, ?, 0)`,
  [doctor.nombre, doctor.email, doctor.contrasena],
  (_tx, result) => {
  // Aquí obtenemos el ID insertado
  resolve(result.insertId);
  },
  (_tx, error) => {
  console.error('Error al guardar doctor local:', error);
  reject(error);
  return false;
  }
  );
  });
  });
  };
  export const guardarPaciente = async (paciente: any): Promise<number> => {
    const database = await openDatabase();
  
    return new Promise((resolve, reject) => {
      database.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO pacientes (
            nombre, edad, fechaNacimiento, lugarNacimiento, estadoCivil,
            cuidador, escolaridad, ocupacion, enfermedades, antecedentes, doctorId
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            paciente.doctorId  
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
  
  try {
  const doctorId = await AsyncStorage.getItem('doctor_id');
  if (!doctorId) {
  throw new Error('No se encontró el ID del doctor en la sesión');
  }return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `SELECT id, nombre, edad, fechaNacimiento, lugarNacimiento, estadoCivil,
                cuidador, escolaridad, ocupacion, enfermedades, antecedentes
         FROM pacientes WHERE doctorId = ?`,
        [doctorId],
        (_, { rows }) => {
          const pacientes = rows.raw();
          resolve(pacientes);
        },
        (_, error) => {
          console.log('Error al cargar pacientes:', error);
          reject(error);
          return false;
        }
      );
    });
  });
} catch (error) {
  console.error('Error al obtener el ID del doctor desde AsyncStorage:', error);
  return [];
}
};
//obtenerpaciente porid
export const obtenerPacientePorId = async (id: number) => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const db = await openDatabase();
  const resultado = await db.executeSql('SELECT * FROM pacientes WHERE id = ?', [id]);
  if (resultado[0].rows.length > 0) {
    return resultado[0].rows.item(0);
  }
  return null;
};

//AGREGAR CITA
export const agregarCita = async (cita: any): Promise<number> => {

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO CitasPacientes (
          PacienteID, DoctorID, FechaHoraCita, EstadoCita, MotivoCita,
          NotasAdicionales, Diagnostico, Tratamiento, sincronizado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          cita.PacienteID,
          cita.DoctorID,
          cita.FechaHoraCita,
          cita.EstadoCita || 'pendiente',
          cita.MotivoCita,
          cita.NotasAdicionales,
          cita.Diagnostico,
          cita.Tratamiento,
        ],
        async (_, result) => {
          const nuevaCita = {
            ...cita,
            id: result.insertId,
          };
          await agendarNotificacionCita(nuevaCita);
          resolve(result.insertId);
        },
        (_, error) => {
          console.log('Error al guardar cita local:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
//EDITAR CITA
export const editarCita = async (cita: { id: any; FechaHoraCita: any; EstadoCita: any; MotivoCita: any; NotasAdicionales: any; Diagnostico: any; Tratamiento: any;  }) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
   `UPDATE CitasPacientes SET 
  FechaHoraCita = ?, 
  EstadoCita = ?, 
  MotivoCita = ?, 
  NotasAdicionales = ?, 
  Diagnostico = ?, 
  Tratamiento = ?
WHERE id = ?`,
        [
          cita.FechaHoraCita,
          cita.EstadoCita,
          cita.MotivoCita,
          cita.NotasAdicionales,
          cita.Diagnostico,
          cita.Tratamiento,
          cita.id,
        ],
        async () => {
          await agendarNotificacionCita({
            id: cita.id,
            FechaHoraCita: cita.FechaHoraCita,
            EstadoCita: cita.EstadoCita,
            MotivoCita: cita.MotivoCita,
            NotasAdicionales: cita.NotasAdicionales,
            Diagnostico: cita.Diagnostico,
            Tratamiento: cita.Tratamiento,
          });
          resolve();
        },
        (_, error) => {
          console.log('Error al editar cita local:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};


//OBTENER CITAS POR DOCTOR
export const obtenerCitasPorDoctor = async (doctorId: number): Promise<any[]> => {


  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM CitasPacientes WHERE DoctorID = ? ORDER BY FechaHoraCita ASC`,
        [doctorId],
        (_, { rows }) => {
          const citas = [];
          for (let i = 0; i < rows.length; i++) {
            citas.push(rows.item(i));
          }
          resolve(citas);
        },
        (_, error) => {
          console.log('Error al obtener citas por doctor:', error);
          reject(error);
          return false;
        }
      );
    });
  });
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

  //RECETA
//AGREGAR RECETA
export const agregarReceta = async (receta: any): Promise<number> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO recetas (
          CitaID, PacienteID, DoctorID, Medicamento, Dosis, ViaAdministracion,
          DuracionTratamiento, InstruccionesAdicionales, FirmaDigital, sincronizado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          receta.CitaID,
          receta.PacienteID,
          receta.DoctorID,
          receta.Medicamento,
          receta.Dosis,
          receta.ViaAdministracion || null,
          receta.DuracionTratamiento || null,
          receta.InstruccionesAdicionales || null,
          receta.FirmaDigital || null
        ],
        (_, result) => {
          resolve(result.insertId);
        },
        (_, error) => {
          console.log('Error al guardar receta local:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
//EDITAR RECETA
export const editarReceta = async (receta: {
  id: number;
  Medicamento: string;
  Dosis: string;
  ViaAdministracion?: string;
  DuracionTratamiento?: string;
  InstruccionesAdicionales?: string;
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE recetas SET
          Medicamento = ?,
          Dosis = ?,
          ViaAdministracion = ?,
          DuracionTratamiento = ?,
          InstruccionesAdicionales = ?,
          sincronizado = 0
        WHERE id = ?`,
        [
          receta.Medicamento,
          receta.Dosis,
          receta.ViaAdministracion || '',
          receta.DuracionTratamiento || '',
          receta.InstruccionesAdicionales || '',
          receta.id,
        ],
        () => resolve(),
        (_, error) => {
          console.log('Error al editar receta local:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
//obtener recetas por cita
export const obtenerRecetasPorCita = async (citaId: number): Promise<any[]> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM recetas WHERE CitaID = ? ORDER BY id ASC`,
        [citaId],
        (_, { rows }) => {
          const recetas = [];
          for (let i = 0; i < rows.length; i++) {
            recetas.push(rows.item(i));
          }
          resolve(recetas);
        },
        (_, error) => {
          console.log('Error al obtener recetas por cita:', error);
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

//DOCTORES PENDIENTES
export const marcarDoctorComoSincronizado = async (doctorId: number): Promise<void> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `UPDATE doctores SET sincronizado = 1 WHERE id = ?`,
        [doctorId],
        () => resolve(),
        (_, error) => {
          console.error('Error al marcar doctor como sincronizado:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
export const obtenerDoctoresPendientes = async (): Promise<any[]> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM doctores WHERE sincronizado = 0`,
        [],
        (_, { rows }) => {
          const doctores: any[] = [];
          for (let i = 0; i < rows.length; i++) {
            doctores.push(rows.item(i));
          }
          resolve(doctores);
        },
        (_, error) => {
          console.error('Error al obtener doctores no sincronizados:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
//CITAS PENDIENTES
export const marcarCitaComoSincronizada = async (id: number): Promise<void> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'UPDATE CitasPacientes SET sincronizado = 1 WHERE id = ?',
        [id],
        () => resolve(),
        (_, error) => {
          console.log('Error al marcar cita como sincronizada:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};


export const obtenerCitasPendientes = async (): Promise<any[]> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM CitasPacientes WHERE sincronizado = 0',
        [],
        (_, { rows }) => {
          const citas = [];
          for (let i = 0; i < rows.length; i++) {
            citas.push(rows.item(i));
          }
          resolve(citas);
        },
        (_, error) => {
          console.log('Error al obtener citas pendientes:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
//edicion citas pendientes
export const guardarEdicionCitaPendiente = async (id: number, nuevosDatos: any): Promise<void> => {
  const database = await openDatabase();
  const nuevosDatosStr = JSON.stringify(nuevosDatos);

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO ediciones_citas_pendientes (citaId, nuevosDatos) VALUES (?, ?)`,
        [id, nuevosDatosStr],
        () => resolve(),
        (_, error) => {
          console.log('Error al guardar edición pendiente de cita:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
//edicionespendientes citas
export const obtenerEdicionesCitasPendientes = async (): Promise<any[]> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM ediciones_citas_pendientes',
        [],
        (_, { rows }) => {
          const ediciones = [];
          for (let i = 0; i < rows.length; i++) {
            ediciones.push(rows.item(i));
          }
          resolve(ediciones);
        },
        (_, error) => {
          console.log('Error al obtener ediciones de citas pendientes:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
//eliminaciones pendietes citas
export const eliminarEdicionCitaPendiente = async (id: number): Promise<void> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM ediciones_citas_pendientes WHERE id = ?',
        [id],
        () => resolve(),
        (_, error) => {
          console.log('Error al eliminar edición pendiente de cita:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
//RECETA
export const marcarRecetaComoSincronizada = async (id: number): Promise<void> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'UPDATE recetas SET sincronizado = 1 WHERE id = ?',
        [id],
        () => resolve(),
        (_, error) => {
          console.log('Error al marcar receta como sincronizada:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
//recetas pendientes
export const obtenerRecetasPendientes = async (): Promise<any[]> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM recetas WHERE sincronizado = 0',
        [],
        (_, { rows }) => {
          const recetas = [];
          for (let i = 0; i < rows.length; i++) {
            recetas.push(rows.item(i));
          }
          resolve(recetas);
        },
        (_, error) => {
          console.log('Error al obtener recetas pendientes:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
//ediciones recetas pendientes
export const guardarEdicionRecetaPendiente = async (id: number, nuevosDatos: any): Promise<void> => {
  const database = await openDatabase();
  const nuevosDatosStr = JSON.stringify(nuevosDatos);

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO ediciones_recetas_pendientes (recetaId, nuevosDatos) VALUES (?, ?)`,
        [id, nuevosDatosStr],
        () => resolve(),
        (_, error) => {
          console.log('Error al guardar edición pendiente de receta:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
//obtener ediciones recetas pendientes
export const obtenerEdicionesRecetasPendientes = async (): Promise<any[]> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM ediciones_recetas_pendientes',
        [],
        (_, { rows }) => {
          const ediciones = [];
          for (let i = 0; i < rows.length; i++) {
            ediciones.push(rows.item(i));
          }
          resolve(ediciones);
        },
        (_, error) => {
          console.log('Error al obtener ediciones de recetas pendientes:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};
//eliminar ediciones recetas pendientes
export const eliminarEdicionRecetaPendiente = async (id: number): Promise<void> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM ediciones_recetas_pendientes WHERE id = ?',
        [id],
        () => resolve(),
        (_, error) => {
          console.log('Error al eliminar edición pendiente de receta:', error);
          reject(error);
          return false;
        }
      );
    });
  });
};