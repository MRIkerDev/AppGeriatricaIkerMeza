'use client';

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import axios from 'axios';

const PantallaClima = () => {
  const [city, setCity] = useState('La Paz');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = 'bf81d03f052a4406f99baccb8bb3f1ac';

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError('Por favor, ingresa una ciudad válida.');
      setWeather(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&units=metric&lang=es&appid=${API_KEY}`,
      );
      setWeather(response.data);
    // eslint-disable-next-line no-catch-shadow, @typescript-eslint/no-shadow
    } catch (error: unknown) {
      setWeather(null);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setError('Ciudad no encontrada. Intenta con otra.');
      } else {
        setError('Ocurrió un error al consultar el clima. Inténtalo más tarde.');
      }
  } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
    fetchWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };
  const getWeatherEmoji = (main: string) => {
    const weatherTypes: { [key: string]: string } = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Drizzle: '🌦️',
      Thunderstorm: '⛈️',
      Snow: '❄️',
      Mist: '🌫️',
      Smoke: '🌫️',
      Haze: '🌫️',
      Dust: '🌫️',
      Fog: '🌫️',
      Sand: '🌫️',
      Ash: '🌫️',
      Squall: '💨',
      Tornado: '🌪️',
    };
    return weatherTypes[main] || '🌡️';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0A2463" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Clima</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔍</Text>
            <TextInput
              style={styles.input}
              placeholder="Buscar ciudad..."
              placeholderTextColor="#9CA3AF"
              value={city}
              onChangeText={(text) => {
                setCity(text);
                if (error) {
                  setError(null);
                }
              }}
              editable={!loading}
            />
          </View>

          <TouchableOpacity style={styles.searchButton} onPress={fetchWeather} disabled={loading} activeOpacity={0.8}>
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4D96FF" />
            <Text style={styles.loadingText}>Consultando clima...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {weather && !loading && !error && (
          <View style={styles.weatherCard}>
            <View style={styles.locationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>
                {weather.name}, {weather.sys.country}
              </Text>
            </View>

            <View style={styles.mainWeather}>
              {weather.weather[0].icon && (
                <Image source={{ uri: getWeatherIcon(weather.weather[0].icon) }} style={styles.weatherIcon} />
              )}
              <Text style={styles.temperature}>{Math.round(weather.main.temp)}°C</Text>
              <Text style={styles.weatherEmoji}>{getWeatherEmoji(weather.weather[0].main)}</Text>
            </View>

            <Text style={styles.description}>{weather.weather[0].description}</Text>

            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>💧</Text>
                <Text style={styles.detailLabel}>Humedad</Text>
                <Text style={styles.detailValue}>{weather.main.humidity}%</Text>
              </View>

              <View style={styles.detailDivider} />

              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>💨</Text>
                <Text style={styles.detailLabel}>Viento</Text>
                <Text style={styles.detailValue}>{Math.round(weather.wind.speed * 3.6)} km/h</Text>
              </View>

              <View style={styles.detailDivider} />

              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>🌡️</Text>
                <Text style={styles.detailLabel}>Sensación</Text>
                <Text style={styles.detailValue}>{Math.round(weather.main.feels_like)}°C</Text>
              </View>
            </View>

            <View style={styles.minMaxContainer}>
              <View style={styles.minMaxItem}>
                <Text style={styles.minMaxIcon}>⬇️</Text>
                <Text style={styles.minMaxLabel}>Mínima</Text>
                <Text style={styles.minMaxValue}>{Math.round(weather.main.temp_min)}°C</Text>
              </View>

              <View style={styles.minMaxDivider} />

              <View style={styles.minMaxItem}>
                <Text style={styles.minMaxIcon}>⬆️</Text>
                <Text style={styles.minMaxLabel}>Máxima</Text>
                <Text style={styles.minMaxValue}>{Math.round(weather.main.temp_max)}°C</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Datos proporcionados por OpenWeatherMap</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
scrollContent: {
    flexGrow: 1,
  },
header: {
    backgroundColor: '#0A2463',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
   textAlign: 'center',
  },
searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    fontSize: 18,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  searchButton: {
    backgroundColor: '#4D96FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#0A2463',
    fontSize: 16,
  },
  errorContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 10,
},
  errorText: {
    color: '#B71C1C',
    textAlign: 'center',
    fontSize: 16,
  },
  weatherCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2463',
  },
  mainWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  weatherIcon: {
    width: 80,
    height: 80,
  },
  temperature: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#0A2463',
    marginHorizontal: 10,
  },
  weatherEmoji: {
    fontSize: 40,
  },
  description: {
    fontSize: 18,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailDivider: {
    width: 1,
    backgroundColor: '#D1D5DB',
  },
  detailIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A2463',
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 15,
  },
  minMaxItem: {
    flex: 1,
    alignItems: 'center',
  },
  minMaxDivider: {
    width: 1,
    backgroundColor: '#D1D5DB',
  },
  minMaxIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  minMaxLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  minMaxValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A2463',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 12,
  },
});

export default PantallaClima;
