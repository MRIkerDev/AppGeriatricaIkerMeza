import AsyncStorage from '@react-native-async-storage/async-storage';

export const obtenerDoctorIdActual = async (): Promise<number | null> => {
const id = await AsyncStorage.getItem('doctor_id');
return id ? parseInt(id) : null;
};