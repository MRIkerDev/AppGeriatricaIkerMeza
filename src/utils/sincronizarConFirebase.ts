//sincronizarConFirebase.ts
import { obtenerPacientesPendientes,marcarPacienteComoSincronizado} from '../database/database';
import { hayInternet } from '../utils/checarInternet';
import { eliminarPacienteFirebase, guardarPacienteFirebase, guardarPruebaFirebase } from '../utils/firebaseService';
import { openDatabase } from '../database/database';



export const sincronizarConFirebase = async () => {
  const internetDisponible = await hayInternet();
  if (!internetDisponible) {
    console.log('Sin conexión a internet, no se puede sincronizar');
    return;
  }

  // 1. Pacientes nuevos
  const pacientesPendientes = await obtenerPacientesPendientes();
  for (let paciente of pacientesPendientes) {
    try {
      await guardarPacienteFirebase(paciente);
      await marcarPacienteComoSincronizado(paciente.id);
    } catch (error) {
      console.log('Error al sincronizar paciente:', error);
    }
  }

  // 2. Pacientes eliminados
  await eliminarPendientesFirebase();

  // 3. Ediciones pendientes
  await sincronizarEdicionesPendientes();

  // 4. Resultados pendientes
  await sincronizarResultadosPendientes();

  console.log('Sincronización completa con Firebase');
};

export const eliminarPendientesFirebase = async () => {
  const db = await openDatabase();

  const [result] = await db.executeSql('SELECT pacienteId FROM eliminaciones_pendientes');
  const pendientes: any[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    pendientes.push(result.rows.item(i));
  }

  for (let item of pendientes) {
    try {
      await eliminarPacienteFirebase(item.pacienteId);
      await db.executeSql('DELETE FROM eliminaciones_pendientes WHERE pacienteId = ?', [item.pacienteId]);
      console.log(`Eliminado paciente pendiente ${item.pacienteId} de Firebase`);
    } catch (error) {
      console.log('Error al eliminar pendiente de Firebase:', error);
    }
  }
};


export const sincronizarEdicionesPendientes = async () => {
  const database = await openDatabase();
  const [result] = await database.executeSql('SELECT * FROM ediciones_pendientes');

  for (let i = 0; i < result.rows.length; i++) {
    const { pacienteId, nuevosDatos } = result.rows.item(i);
    const nuevosDatosParsed = JSON.parse(nuevosDatos);

    try {
      await guardarPacienteFirebase({ id: pacienteId, ...nuevosDatosParsed });
      await database.executeSql('DELETE FROM ediciones_pendientes WHERE pacienteId = ?', [pacienteId]);
      console.log(`Edición del paciente ${pacienteId} sincronizada`);
    } catch (error) {
      console.log('Error al sincronizar edición pendiente:', error);
    }
  }
};

export const sincronizarResultadosPendientes = async () => {
  const db = await openDatabase();
  const [result] = await db.executeSql('SELECT * FROM resultados WHERE sincronizado = 0');

  for (let i = 0; i < result.rows.length; i++) {
    const row = result.rows.item(i);
    try {
      // Sincroniza el resultado con Firebase
      await guardarPruebaFirebase(row.pacienteId.toString(), row.nombrePrueba, row.puntaje);
      
      // Marca el resultado como sincronizado en la base de datos local
      await db.executeSql('UPDATE resultados SET sincronizado = 1 WHERE id = ?', [row.id]);
      
      console.log(`Resultado de ${row.nombrePrueba} sincronizado para paciente ${row.pacienteId}`);
    } catch (error) {
      console.log('Error al sincronizar resultado:', error);
    }
  }
};


