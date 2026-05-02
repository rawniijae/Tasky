import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import * as Location from 'expo-location';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useHaptics } from '@/src/hooks/useHaptics';

interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  isDay: boolean;
  city: string;
}

// WMO Weather interpretation codes
const WEATHER_CONFIG: Record<number, { icon: string; label: string }> = {
  0: { icon: '☀️', label: 'Clear' },
  1: { icon: '🌤️', label: 'Mostly Clear' },
  2: { icon: '⛅', label: 'Partly Cloudy' },
  3: { icon: '☁️', label: 'Cloudy' },
  45: { icon: '🌫️', label: 'Foggy' },
  48: { icon: '🌫️', label: 'Foggy' },
  51: { icon: '🌦️', label: 'Drizzle' },
  61: { icon: '🌧️', label: 'Rainy' },
  71: { icon: '❄️', label: 'Snowy' },
  80: { icon: '🌧️', label: 'Showers' },
  95: { icon: '⛈️', label: 'Thunderstorm' },
};

export function WeatherWidget() {
  const { colors, isDark } = useTheme();
  const haptics = useHaptics();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const getLocation = async () => {
    try {
      // Add a timeout to permission request to avoid infinite loading
      const permissionPromise = Location.requestForegroundPermissionsAsync();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const { status } = await (Promise.race([permissionPromise, timeoutPromise]) as Promise<Location.LocationPermissionResponse>);
      
      if (status !== 'granted') return null;

      const locPromise = Location.getCurrentPositionAsync({

        accuracy: Location.Accuracy.Balanced,
      });
      const locTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Loc Timeout')), 8000)
      );

      const loc = await (Promise.race([locPromise, locTimeoutPromise]) as Promise<Location.LocationObject>);
      
      const [place] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });


      return {
        lat: loc.coords.latitude,
        lon: loc.coords.longitude,
        city: place?.city || place?.subregion || 'My Location'
      };
    } catch (e) {
      console.log('Location error:', e);
      return null;
    }
  };


  const getIPLocation = async () => {
    try {
      // Try ipapi.co first
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.latitude) return { lat: data.latitude, lon: data.longitude, city: data.city };
      
      // Secondary fallback: ip-api.com
      const res2 = await fetch('http://ip-api.com/json/');
      const data2 = await res2.json();
      return { lat: data2.lat, lon: data2.lon, city: data2.city };
    } catch {
      return null;
    }
  };


  const fetchWeather = useCallback(async (isRefresh = false) => {
    if (isRefresh) haptics.light();
    setLoading(true);
    setError(false);

    try {
      const location = (await getLocation()) || (await getIPLocation());
      if (!location) throw new Error('No location');

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,apparent_temperature,weather_code,is_day&temperature_unit=celsius`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      if (data.current) {
        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          apparentTemperature: Math.round(data.current.apparent_temperature),
          weatherCode: data.current.weather_code,
          isDay: data.current.is_day === 1,
          city: location.city,
        });
      }
    } catch (err) {
      console.log('Weather Error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [haptics.light]); // Only depend on the specific function, not the whole object

  const initialFetchRef = useRef(false);
  useEffect(() => {
    if (!initialFetchRef.current) {
      initialFetchRef.current = true;
      fetchWeather();
    }
  }, [fetchWeather]);


  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 10 }, () => {
      scale.value = withSpring(1);
    });
    fetchWeather(true);
  };

  if (error || (!loading && !weather)) return null;

  const weatherInfo = weather ? (WEATHER_CONFIG[weather.weatherCode] || (weather.weatherCode > 60 ? WEATHER_CONFIG[61] : WEATHER_CONFIG[0])) : { icon: '🌡️', label: '...' };
  const icon = weather?.isDay ? weatherInfo.icon : weatherInfo.icon.replace('☀️', '🌙').replace('🌤️', '🌙');

  return (
    <Animated.View entering={FadeIn.duration(400)} style={animatedStyle}>
      <Pressable 
        onPress={handlePress}
        style={[
          styles.container,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          }
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.textTertiary} style={{ paddingHorizontal: 10 }} />
        ) : (
          <>
            <Text style={styles.icon}>{icon}</Text>
            <View style={styles.textContainer}>
              <Text style={[styles.temp, { color: colors.text }]}>
                {weather?.temperature}°
              </Text>
              <Text style={[styles.city, { color: colors.textTertiary }]} numberOfLines={1}>
                {weather?.city}
              </Text>
            </View>
          </>
        )}
      </Pressable>
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
  city: {
    fontSize: 9,
    fontWeight: '500',
    lineHeight: 11,
    letterSpacing: 0.3,
  },

});
