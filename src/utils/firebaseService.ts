// firebaseService.ts
import { db } from '../../firebaseConfig'; 
import { ref, set , remove, update, push} from 'firebase/database';

//CON INTERNET
//DOCTOR
//AGREGAR DOCTOR
export const guardarDoctorFirebase = async (doctor: any) => {
  try {
    const nuevaRef = push(ref(db, 'doctores'));
    await set(nuevaRef, {
      nombre: doctor.nombre,
      email: doctor.email,
      contrasena: doctor.contrasena,
    });
    console.log('Doctor subido a Firebase:', doctor);
  } catch (error) {
    console.error('Error al subir doctor a Firebase:', error);
  }
};
//PACIENTE
//AGREGAR PACIENTE
export const guardarPacienteFirebase = async (paciente: any) => {
  try {
    const pacienteRef = ref(db, `pacientes/${paciente.id}`);
    await set(pacienteRef, paciente);
    console.log('Paciente guardado en Firebase');
  } catch (error) {
    console.error('Error al guardar paciente en Firebase:', error);
  }
};
//ELIMINAR 
export const eliminarPacienteFirebase = async (pacienteId: string | number) => {
  const referencia = ref(db, `pacientes/${pacienteId}`);
  await remove(referencia);
  console.log(`Paciente ${pacienteId} eliminado de Firebase`);
};

//EDITAR
export const editarPacienteFirebase = async (pacienteId: number, nuevosDatos: any) => {
  try {
    const pacienteRef = ref(db, `pacientes/${pacienteId}`);
    await update(pacienteRef, nuevosDatos);
    console.log(`Paciente ${pacienteId} actualizado en Firebase`);
  } catch (error) {
    console.error('Error al editar paciente en Firebase:', error);
  }
};
//RESULTADOS
//AGREGAR PRUEBA
export const guardarPruebaFirebase = async (pacienteId: number, nombrePrueba: string, puntaje: number) => {
  try {
    const fecha = new Date().toISOString();

    const fechaKey = fecha.replace(/[:.]/g, '-'); 
    const pruebaKey = nombrePrueba.replace(/[\.\#\$\[\]]/g, '').replace(/\s+/g, '_');

    const path = `resultados/${pacienteId}/${pruebaKey}/${fechaKey}`;

    await set(ref(db, path), {
      puntaje,
      fecha,
    });

    console.log('Resultado sincronizado en Firebase correctamente');
  } catch (error) {
    console.error('Error al sincronizar resultado:', error);
    throw error;
  }
};
//CITAS
//AGREGAR CITA
export const guardarCitaFirebase = async (cita: any) => {
  try {
    const citaRef = ref(db, `citas/${cita.id}`);
    await set(citaRef, cita);
    console.log('Cita guardada en Firebase');
  } catch (error) {
    console.error('Error al guardar cita en Firebase:', error);
  }
};
//EDITAR CITA
export const editarCitaFirebase = async (id: number, nuevosDatos: any) => {
  try {
    const citaRef = ref(db, `citas/${id}`);
    await update(citaRef, nuevosDatos);
    console.log(`Cita ${id} actualizada en Firebase`);
  } catch (error) {
    console.error('Error al editar cita en Firebase:', error);
  }
};
//RECETA
//AGREGAR RECETA
export const guardarRecetaFirebase = async (receta: any) => {
  try {
    const recetaRef = ref(db, `recetas/${receta.id}`);
    await set(recetaRef, receta);
    console.log('Receta guardada en Firebase');
  } catch (error) {
    console.error('Error al guardar receta en Firebase:', error);
  }
};
//EDITAR RECETA
export const editarRecetaFirebase = async (id: number, nuevosDatos: any) => {
  try {
    const recetaRef = ref(db, `recetas/${id}`);
    await update(recetaRef, nuevosDatos);
    console.log(`Receta ${id} actualizada en Firebase`);
  } catch (error) {
    console.error('Error al editar receta en Firebase:', error);
  }
};

