import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, Button } from 'react-native';
import axios from 'axios';

const PantallaClima = () => {
  const [city, setCity] = useState('La Paz'); // Ciudad por defecto
  const [weather, setWeather] = useState<any>(null); // Estado del clima
  const [loading, setLoading] = useState(false);
  const API_KEY = '34d3e468318a74342b3536cfd9ae457c'; // Reemplaza esto con tu clave real

  // Función para obtener datos del clima
  const fetchWeather = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=es&appid=${API_KEY}`
      );
      setWeather(response.data); // Guardamos la respuesta del clima
    } catch (error: unknown) {
      // Verificamos si el error tiene la propiedad 'message'
      if (error instanceof Error) {
        console.error('Error al obtener el clima:', error.message);
      } else {
        console.error('Error desconocido:', error);
      }
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // Se ejecuta al iniciar la app
  useEffect(() => {
    fetchWeather();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consulta el clima actual</Text>

      {/* Entrada para ciudad */}
      <TextInput
        style={styles.input}
        placeholder="Escribe una ciudad"
        value={city}
        onChangeText={setCity}
      />
      <Button title="Buscar" onPress={fetchWeather} />

      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}

      {/* Mostrar datos si están disponibles */}
      {weather && !loading && (
        <View style={styles.result}>
          <Text style={styles.city}>{weather.name}, {weather.sys.country}</Text>
          <Text style={styles.temp}>{weather.main.temp}°C</Text>
          <Text style={styles.description}>{weather.weather[0].description}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  result: {
    marginTop: 20,
    alignItems: 'center',
  },
  city: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  temp: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 18,
    fontStyle: 'italic',
  },
});

export default PantallaClima;
