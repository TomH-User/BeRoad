import React from 'react'
import { useState, useEffect } from 'react';
import { StyleSheet, View, Button, TextInput, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';


const Home = () => {
  const [region, setRegion] = useState(null);
  const [destination, setDestination] = useState('');
  const [route, setRoute] = useState(null);

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
    })
    ();
  }, []);

  const getCoordinatesFromAddress = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`;
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "BeRoadApp/1.0 (tom_hugues@hotmail.fr)",
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
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "BeRoadApp/1.0 (tom_hugues@hotmail.fr)",
        },
      });

      const geometry = response.data.routes[0]?.geometry;

      if (!geometry) {
        Alert.alert('Erreur', 'Aucun itinéraire trouvé.');
        return;
      }

      const coordinates = decodePolyline(geometry);
      setRoute(coordinates);
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur s\'est produite lors de la récupération de l\'itinéraire.');
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
    <SafeAreaView className="bg-primary h-full">
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TextInput
          style={styles.input}
          placeholder="Entrez votre destination"
          value={destination}
          onChangeText={setDestination}
        />
        <Button title="Tracer l'itinéraire" onPress={getRoute} />
      </View>

      {region && (
        <MapView style={styles.map} initialRegion={region}>
          <Marker coordinate={region} title="Votre position" />
          {route && <Polyline coordinates={route} strokeWidth={5} strokeColor="blue" />}
        </MapView>
      )}
    </View>
    </SafeAreaView>
  )
}

export default Home


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  map: {
    flex: 1,
  },
});
