import React, { useEffect } from 'react';
import AppNavigator from './navigation/AppNavigator';
import { crearTablas } from './database/database'; // Asegúrate que esta ruta es correcta
import { sincronizarConFirebase } from './utils/sincronizarConFirebase.ts';

const App = () => {
  useEffect(() => {

    crearTablas().catch((error) => {
      console.error('Error al crear tablas SQLite:', error);
    });

    sincronizarConFirebase();

    const intervalo = setInterval(() => {
      sincronizarConFirebase();
    }, 600000);

    return () => clearInterval(intervalo);
  }, []);

  return <AppNavigator />;
};

export default App;
