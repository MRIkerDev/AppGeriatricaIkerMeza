//sincronizarConFirebase.ts
import { obtenerPacientesPendientes,marcarPacienteComoSincronizado} from '../database/database';//PACIENTES PENDIENTES
import { obtenerEliminacionesPendientes, eliminarEliminacionPendiente } from '../database/database';//ELIMINACIONES PENDIENTES
import { obtenerEdicionesPendientes, eliminarEdicionPendiente } from '../database/database';//EDICIONES PENDIENTES
import { obtenerResultadosPendientes, marcarResultadoComoSincronizado } from '../database/database';//RESULTADOS PENDIENTES
import { hayInternet } from '../utils/checarInternet';
import { editarPacienteFirebase, eliminarPacienteFirebase, guardarPacienteFirebase, guardarPruebaFirebase } from '../utils/firebaseService';



export const sincronizarConFirebase = async () => {
  const internetDisponible = await hayInternet();
  if (!internetDisponible) {
    console.log('Sin conexión a internet, no se puede sincronizar');
    return;
  }

  // 1. Pacientes nuevos
  await sincronizarPacientesPendientesFirebase();

  // 2. Pacientes eliminados
  await eliminarPacientesPendientesFirebase();

  // 3. Ediciones pendientes
  await sincronizarEdicionesPacientesPendientes();

  // 4. Resultados pendientes
  await sincronizarResultadosPendientes();

  console.log('Sincronización completa con Firebase');
};

//Guardar pacientes pendientes en Firebase
export const sincronizarPacientesPendientesFirebase = async () => {
  const internetDisponible = await hayInternet();

  if (!internetDisponible) {
    console.log('Sin conexión, no se puede sincronizar pacientes pendientes.');
    return;
  }

  try {
    const pacientesPendientes = await obtenerPacientesPendientes();

    for (const paciente of pacientesPendientes) {
      await guardarPacienteFirebase(paciente);
      await marcarPacienteComoSincronizado(paciente.id);
      console.log(`Paciente ${paciente.id} sincronizado correctamente.`);
    }

    console.log('Todos los pacientes pendientes fueron sincronizados.');
  } catch (error) {
    console.error('Error al sincronizar pacientes pendientes:', error);
  }
};

//Eliminar pacientes pendientes en Firebase
export const eliminarPacientesPendientesFirebase = async () => {
  const internetDisponible = await hayInternet();
  if (!internetDisponible) {
    console.log('Sin conexión, no se puede eliminar pacientes pendientes.');
    return;
  }

  try {
    const eliminaciones = await obtenerEliminacionesPendientes();

    for (const pacienteId of eliminaciones) {
      await eliminarPacienteFirebase(pacienteId);
      await eliminarEliminacionPendiente(pacienteId);
      console.log(`Paciente ${pacienteId} eliminado en Firebase y sincronizado`);
    }
  } catch (error) {
    console.error('Error al sincronizar eliminaciones pendientes:', error);
  }
};

//Sincronizar ediciones pendientes en Firebase
export const sincronizarEdicionesPacientesPendientes = async () => {
  const internetDisponible = await hayInternet();
  if (!internetDisponible) return;

  try {
    const ediciones = await obtenerEdicionesPendientes();

    for (const edicion of ediciones) {
      await editarPacienteFirebase(edicion.pacienteId, edicion.nuevosDatos);
      await eliminarEdicionPendiente(edicion.pacienteId);
      console.log(`Paciente ${edicion.pacienteId} sincronizado con sus nuevos datos`);
    }
  } catch (error) {
    console.error('Error al sincronizar ediciones pendientes:', error);
  }
};

export const sincronizarResultadosPendientes = async () => {
  const internetDisponible = await hayInternet();
  if (!internetDisponible) return;

  try {
    const resultados = await obtenerResultadosPendientes();

    console.log('Resultados pendientes a sincronizar:', resultados);

    for (const resultado of resultados) {
      if (resultado.pacienteId == null) {
        console.warn('Omitiendo resultado sin pacienteId:', resultado);
        continue;
      }

      await guardarPruebaFirebase(
        resultado.pacienteId.toString(),
        resultado.nombrePrueba,
        resultado.puntaje
      );
      await marcarResultadoComoSincronizado(resultado.id);
      console.log('Sincronizado resultado:', resultado.id);
    }

    console.log('Todos los resultados pendientes procesados.');
  } catch (error) {
    console.error('Error al sincronizar resultados:', error);
  }
};