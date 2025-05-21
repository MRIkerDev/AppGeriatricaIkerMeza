//sincronizarConFirebase.ts
import { obtenerPacientesPendientes,marcarPacienteComoSincronizado, obtenerDoctoresPendientes, marcarDoctorComoSincronizado, obtenerCitasPendientes, marcarCitaComoSincronizada, obtenerEdicionesCitasPendientes, eliminarEdicionCitaPendiente, obtenerRecetasPendientes, marcarRecetaComoSincronizada, obtenerEdicionesRecetasPendientes, eliminarEdicionRecetaPendiente} from '../database/database';//PACIENTES PENDIENTES
import { obtenerEliminacionesPendientes, eliminarEliminacionPendiente } from '../database/database';//ELIMINACIONES PENDIENTES
import {editarCitaFirebase, editarRecetaFirebase, eliminarPacienteFirebase, guardarCitaFirebase, guardarRecetaFirebase } from '../utils/firebaseService';//ELIMINACIONES PENDIENTES
import { obtenerEdicionesPendientes, eliminarEdicionPendiente } from '../database/database';//EDICIONES PENDIENTES
import {editarPacienteFirebase } from '../utils/firebaseService';//ELIMINACIONES PENDIENTES
import { obtenerResultadosPendientes, marcarResultadoComoSincronizado } from '../database/database';//RESULTADOS PENDIENTES
import { hayInternet } from '../utils/checarInternet';
import {  guardarDoctorFirebase, guardarPacienteFirebase, guardarPruebaFirebase } from '../utils/firebaseService';//DOCTORES PENDIENTES



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
  await sincronizarEdicionesPacientesPendientesFirebase();

  // 4. Resultados pendientes
  await sincronizarResultadosPendientesFirebase();

  // 5. Doctores pendientes
  await sincronizarDoctoresPendientesFirebase();

  // 6. Citas pendientes
  await sincronizarCitasPendientesFirebase();

  // 7. Ediciones citas pendientes
  await sincronizarEdicionesPendientesCitasFirebase();

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
    console.error('No hay pacientes para sincronizar', error);
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
    console.error('No hay eliminaciones pendientes', error);
  }
};

//Sincronizar ediciones pendientes en Firebase
export const sincronizarEdicionesPacientesPendientesFirebase = async () => {
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
    console.error('No hay ediciones pendientes', error);
  }
};
//Sincronizar resultados pendientes en Firebase
export const sincronizarResultadosPendientesFirebase = async () => {
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
    console.error('No hay resultados pendientes', error);
  }
};

//Sincronizar doctores pendientes en Firebase
export const sincronizarDoctoresPendientesFirebase = async () => {
  const internetDisponible = await hayInternet();
  if (!internetDisponible) return;

  try {
    const doctores = await obtenerDoctoresPendientes();

    for (const doctor of doctores) {
      await guardarDoctorFirebase(doctor);
      await marcarDoctorComoSincronizado(doctor.id);
    }

    console.log('Doctores sincronizados con Firebase');
  } catch (error) {
    console.error('No hay doctores pendientes', error);
  }
};
//Sincronizar citas pendientes en Firebase
export const sincronizarCitasPendientesFirebase = async () => {
  const internetDisponible = await hayInternet();
  if (!internetDisponible) {
    console.log('Sin conexión a internet, no se puede sincronizar citas');
    return;
  }

  try {
    const citas = await obtenerCitasPendientes();

    for (const cita of citas) {
      await guardarCitaFirebase(cita);
      await marcarCitaComoSincronizada(cita.CitaID);
    }

    console.log('Citas sincronizadas con éxito.');
  } catch (error) {
    console.error('Error al sincronizar citas:', error);
  }
};
//Sincronizar ediciones citas pendientes en Firebase
export const sincronizarEdicionesPendientesCitasFirebase = async () => {
  const internetDisponible = await hayInternet();
  if (!internetDisponible) {
    console.log('Sin conexión, no se pueden sincronizar ediciones de citas');
    return;
  }

  try {
    const ediciones = await obtenerEdicionesCitasPendientes();

    for (const edicion of ediciones) {
      const citaId = edicion.citaId;
      const nuevosDatos = JSON.parse(edicion.nuevosDatos);

      await editarCitaFirebase(citaId, nuevosDatos);
      await eliminarEdicionCitaPendiente(edicion.id);
    }

    console.log('Ediciones de citas sincronizadas con Firebase');
  } catch (error) {
    console.error('Error al sincronizar ediciones de citas:', error);
  }
};
//Sincronizar recetas pendientes en Firebase
export const sincronizarRecetasPendientesFirebase = async () => {
  const internetDisponible = await hayInternet();
  if (!internetDisponible) {
    console.log('Sin conexión a internet, no se puede sincronizar recetas');
    return;
  }

  try {
    const recetas = await obtenerRecetasPendientes();

    for (const receta of recetas) {
      await guardarRecetaFirebase(receta);
      await marcarRecetaComoSincronizada(receta.id);
    }

    console.log('Recetas sincronizadas con éxito.');
  } catch (error) {
    console.error('Error al sincronizar recetas:', error);
  }
};
//Sincronizar ediciones recetas pendientes en Firebase
export const sincronizarEdicionesPendientesRecetasFirebase = async () => {
  const internetDisponible = await hayInternet();
  if (!internetDisponible) {
    console.log('Sin conexión, no se pueden sincronizar ediciones de recetas');
    return;
  }

  try {
    const ediciones = await obtenerEdicionesRecetasPendientes();

    for (const edicion of ediciones) {
      const recetaId = edicion.recetaId;
      const nuevosDatos = JSON.parse(edicion.nuevosDatos);

      await editarRecetaFirebase(recetaId, nuevosDatos);
      await eliminarEdicionRecetaPendiente(edicion.id);
    }

    console.log('Ediciones de recetas sincronizadas con Firebase');
  } catch (error) {
    console.error('Error al sincronizar ediciones de recetas:', error);
  }
};
