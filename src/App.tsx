import React, { useEffect } from 'react';
import { crearTablas } from './database/database';
import { sincronizarConFirebase } from './utils/sincronizarConFirebase.ts';
import { configurarNotificaciones } from './utils/notificaciones';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import AppNavigator from './navigation/AppNavigator';

const App = () => {
  crearTablas().catch((error) => {
    console.error('Ya fueron creadas las tablas de SQLite:', error);
  });

  useEffect(() => {
    const init = async () => {
      const settings = await notifee.requestPermission();

      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        console.log('Permiso de notificación concedido');
      } else {
        console.warn('Permiso de notificación DENEGADO');
      }
     configurarNotificaciones();

      sincronizarConFirebase();

      const intervalo = setInterval(() => {
        sincronizarConFirebase();
      }, 600000); // cada 10 minutos
      // await notifee.displayNotification({
      //   title: 'Notificación de prueba',
      //   body: 'Esto es una notificación inmediata',
      //   android: {
      //     channelId: 'citas-channel',
      //     pressAction: {
      //       id: 'default',
      //     },
      //   },
      // });
      return () => clearInterval(intervalo);
    };

    init();
  }, []);

  return <AppNavigator />;
};

export default App;
