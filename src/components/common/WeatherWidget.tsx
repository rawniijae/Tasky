import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/src/theme/ThemeProvider';

// Dynamically import expo-location so it doesn't crash if unavailable
let LocationModule: typeof import('expo-location') | null = null;
try {
  LocationModule = require('expo-location');
} catch {
  // expo-location not available — will use IP fallback
}

interface WeatherData {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
  city: string;
}

// WMO Weather interpretation codes → emoji + label
function getWeatherInfo(code: number, isDay: boolean): { icon: string; label: string } {
  if (code === 0) return { icon: isDay ? '☀️' : '🌙', label: 'Clear' };
  if (code === 1) return { icon: isDay ? '🌤️' : '🌙', label: 'Mostly Clear' };
  if (code === 2) return { icon: '⛅', label: 'Partly Cloudy' };
  if (code === 3) return { icon: '☁️', label: 'Cloudy' };
  if (code === 45 || code === 48) return { icon: '🌫️', label: 'Foggy' };
  if (code >= 51 && code <= 57) return { icon: '🌦️', label: 'Drizzle' };
  if (code >= 61 && code <= 67) return { icon: '🌧️', label: 'Rainy' };
  if (code >= 71 && code <= 77) return { icon: '❄️', label: 'Snowy' };
  if (code >= 80 && code <= 82) return { icon: '🌧️', label: 'Showers' };
  if (code >= 85 && code <= 86) return { icon: '🌨️', label: 'Snow Showers' };
  if (code >= 95 && code <= 99) return { icon: '⛈️', label: 'Thunderstorm' };
  return { icon: '🌡️', label: 'Weather' };
}

export function WeatherWidget() {
  const { colors, isDark } = useTheme();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchWeather() {
      try {
        let latitude: number | undefined;
        let longitude: number | undefined;
        let city = '';

        // Try device location first (only if expo-location is available)
        if (LocationModule) {
          try {
            const { status } = await LocationModule.requestForegroundPermissionsAsync();
            if (status === 'granted') {
              const loc = await LocationModule.getCurrentPositionAsync({
                accuracy: LocationModule.Accuracy.Balanced,
              });
              latitude = loc.coords.latitude;
              longitude = loc.coords.longitude;

              // Reverse geocode to get city name
              try {
                const [place] = await LocationModule.reverseGeocodeAsync({
                  latitude,
                  longitude,
                });
                if (place) {
                  city = place.city || place.subregion || place.region || '';
                }
              } catch {
                // Reverse geocode can fail, that's fine
              }
            }
          } catch {
            // Location permission denied or unavailable
          }
        }

        // Fallback: IP-based geolocation (for web or if permissions denied)
        if (!latitude || !longitude) {
          try {
            const geoRes = await fetch('https://ipapi.co/json/');
            const geoData = await geoRes.json();
            latitude = geoData.latitude;
            longitude = geoData.longitude;
            city = city || geoData.city || '';
          } catch {
            setError(true);
            setLoading(false);
            return;
          }
        }

        if (!latitude || !longitude) {
          setError(true);
          setLoading(false);
          return;
        }

        // Fetch current weather from Open-Meteo (free, no API key)
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&temperature_unit=celsius`
        );
        const weatherData = await weatherRes.json();

        if (weatherData.current) {
          setWeather({
            temperature: Math.round(weatherData.current.temperature_2m),
            weatherCode: weatherData.current.weather_code,
            isDay: weatherData.current.is_day === 1,
            city,
          });
        } else {
          setError(true);
        }
      } catch (e) {
        console.log('Weather fetch failed:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  // Don't render anything if there's an error
  if (error) return null;

  // Loading state – tiny spinner
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? 'rgba(51,65,85,0.5)' : 'rgba(241,245,249,0.9)',
            borderColor: isDark ? 'rgba(71,85,105,0.4)' : 'rgba(226,232,240,0.8)',
          },
        ]}
      >
        <ActivityIndicator size="small" color={colors.textTertiary} />
      </View>
    );
  }

  if (!weather) return null;

  const { icon, label } = getWeatherInfo(weather.weatherCode, weather.isDay);

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? 'rgba(51,65,85,0.5)'
            : 'rgba(241,245,249,0.9)',
          borderColor: isDark
            ? 'rgba(71,85,105,0.4)'
            : 'rgba(226,232,240,0.8)',
        },
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.temp, { color: colors.text }]}>
          {weather.temperature}°C
        </Text>
        <Text
          style={[styles.label, { color: colors.textTertiary }]}
          numberOfLines={1}
        >
          {weather.city || label}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  icon: {
    fontSize: 16,
  },
  textContainer: {
    alignItems: 'flex-end',
  },
  temp: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  label: {
    fontSize: 9,
    fontWeight: '500',
    lineHeight: 11,
    letterSpacing: 0.3,
  },
});
