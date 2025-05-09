// firebaseService.ts
import { db } from '../../firebaseConfig'; 
import { ref, set , remove} from 'firebase/database';



export const guardarPacienteFirebase = async (paciente: any) => {
  try {
    const pacienteRef = ref(db, `pacientes/${paciente.id}`);
    await set(pacienteRef, paciente);
    console.log('Paciente guardado en Firebase');
  } catch (error) {
    console.error('Error al guardar paciente en Firebase:', error);
  }
};

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


export const eliminarPacienteFirebase = async (pacienteId: string | number) => {
  const referencia = ref(db, `pacientes/${pacienteId}`);
  await remove(referencia);
  console.log(`Paciente ${pacienteId} eliminado de Firebase`);
};


