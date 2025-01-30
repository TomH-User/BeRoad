import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button, TextInput, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_KEY = "ad761fb4199ddca53a345fafab5a4cf9";

const Home = () => {
  const [region, setRegion] = useState(null);
  const [destination, setDestination] = useState('');
  const [route, setRoute] = useState(null);
  
  const [weather, setWeather] = useState(null);
  const [showWeather, setShowWeather] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'La géolocalisation est requise pour utiliser cette fonctionnalité.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      fetchWeather(location.coords.latitude, location.coords.longitude);
    })();
  }, []);

  const fetchWeather = async (lat, lon) => {
    const now = Date.now();
    const cachedWeather = await AsyncStorage.getItem('weatherData');
    const cachedTime = await AsyncStorage.getItem('weatherTimestamp');

    if (cachedWeather && cachedTime && now - parseInt(cachedTime) < 10 * 60 * 1000) {
      console.log("Données météo récupérées depuis le cache");
      setWeather(JSON.parse(cachedWeather));
      return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    try {
      const response = await axios.get(url);
      setWeather(response.data);
      setLastFetchTime(now);
      await AsyncStorage.setItem('weatherData', JSON.stringify(response.data));
      await AsyncStorage.setItem('weatherTimestamp', now.toString());
    } catch (error) {
      console.error("Erreur lors de la récupération de la météo", error);
    }
  };

  const getCoordinatesFromAddress = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`;
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "BeRoadApp/1.0",
        },
      });
      const { lat, lon } = response.data[0];
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    } catch (error) {
      Alert.alert("Erreur", "Impossible de trouver l'adresse. Vérifiez l'adresse saisie.");
      console.error(error);
    }
  };
  

  const getRoute = async () => {
    if (!region) {
      Alert.alert('Erreur', 'La localisation actuelle est indisponible.');
      return;
    }

    if (!destination.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une destination.');
      return;
    }

    const destinationCoords = await getCoordinatesFromAddress(destination);
    if (!destinationCoords) return;

    const url = `http://router.project-osrm.org/route/v1/car/${region.longitude},${region.latitude};${destinationCoords.longitude},${destinationCoords.latitude}?overview=full&geometries=polyline`;

    try {
      const response = await axios.get(url, { headers: { "User-Agent": "BeRoadApp/1.0" } });
      const geometry = response.data.routes[0]?.geometry;    
      if (!geometry) {
        Alert.alert('Erreur', 'Aucun itinéraire trouvé.');
        return;
      }

      const coordinates = decodePolyline(geometry);
      setRoute(coordinates);

    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la récupération de l\'itinéraire.');
      console.error(error);
    }
  };

  const decodePolyline = (encoded) => {
    let points = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TextInput
          style={styles.input}
          placeholder="Entrez votre destination"
          value={destination}
          onChangeText={setDestination}
        />
      <View style={styles.buttonContainer}>
        <Button
          title={showWeather ? "Désactiver météo" : "Afficher météo"}
          onPress={() => {
            if (!showWeather) {
              fetchWeather(region.latitude, region.longitude);
            }
            setShowWeather(!showWeather);
          }}
        />
        <Button title="Tracer l'itinéraire" onPress={getRoute} />
      </View>
      </View>

      {region && (
        <MapView style={styles.map} initialRegion={region}>
          <Marker coordinate={region} title="Votre position" />
          {route && <Polyline coordinates={route} strokeWidth={5} strokeColor="blue" />}
          {showWeather && <UrlTile
            urlTemplate={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
            zIndex={2}
          />}
        </MapView>
      )}

      {showWeather && weather && (
        <View style={styles.weatherContainer}>
          <Text style={styles.weatherText}>🌡 {weather.main.temp}°C</Text>
          <Text style={styles.weatherText}>🌧 {weather.weather[0].description}</Text>
        </View>
      )}

    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'column', alignItems: 'center', padding: 10, backgroundColor: '#fff' },
  input: { width: '90%', height: 40, borderColor: '#ccc', borderWidth: 1, paddingHorizontal: 8, borderRadius: 5, marginBottom: 10 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '90%' },
  map: { flex: 1 },
  weatherContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  weatherText: { fontSize: 16, fontWeight: 'bold' },
});
