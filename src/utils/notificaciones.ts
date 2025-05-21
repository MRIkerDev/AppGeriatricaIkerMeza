import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

export const configurarNotificaciones = async () => {
  const settings = await notifee.requestPermission();
  console.log('Permisos notificaciones:', settings);

  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'citas-channel',
      name: 'Citas Médicas',
      importance: AndroidImportance.HIGH,
      vibration: true,
      sound: 'default',
    });
  }
};

export const agendarNotificacionCita = async (cita: any) => {
  const horaCita = new Date(cita.FechaHoraCita).getTime();
  const ahora = Date.now();

  const diferencia = horaCita - ahora;

  if (diferencia <= 0) {
    console.log('La cita ya pasó o es muy cercana, no se agenda notificación.');
    return;
  }

  console.log('Se agenda con setTimeout para:', diferencia / 1000, 'segundos');

  setTimeout(async () => {
    try {
      await notifee.displayNotification({
        title: 'Es hora de tu cita',
        body: `Tienes una cita por: ${cita.MotivoCita}`,
        android: {
          channelId: 'citas-channel',
          pressAction: {
            id: 'default',
          },
          smallIcon: 'ic_launcher',
        },
        data: {
          tipo: 'cita',
          idCita: String(cita.id),
        },
      });
    } catch (error) {
      console.error('Error al mostrar notificación:', error);
    }
  }, diferencia);
};
