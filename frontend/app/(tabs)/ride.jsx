import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, StatusBar, TextInput, TouchableOpacity, Text, Alert, Animated, PanResponder, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Image } from 'react-native';
import debounce from "lodash.debounce";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Linking } from 'react-native';
import { DeviceMotion } from 'expo-sensors';


const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

const Ride = () => {
  const [region, setRegion] = useState(null); // Coordonnées de la position actuelle
  const [destination, setDestination] = useState(''); // Adresse de destination
  const [route, setRoute] = useState(null);  // Coordonnées de l'itinéraire

  const [weather, setWeather] = useState(null); // Données météo
  const [showWeather, setShowWeather] = useState(true); // Affichage de la météo
  const [rainLayerUrl, setRainLayerUrl] = useState(null); // URL de la couche de pluie

  const [suggestions, setSuggestions] = useState([]); // Suggestions d'adresses

  const mapRef = useRef(null);

  const panelHeight = useRef(new Animated.Value(50)).current; // Hauteur initiale réduite du panneau

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10, // Activer si l'utilisateur glisse verticalement
      onPanResponderMove: (_, gestureState) => {
        panelHeight.setValue(Math.max(50, Math.min(300, 200 - gestureState.dy))); // Limite entre 50 et 300 px
      },
      onPanResponderRelease: (_, gestureState) => {
        Animated.timing(panelHeight, {
          toValue: gestureState.dy < 0 ? 450 : 100, // Si glisse vers le haut -> 450px, sinon -> 50px
          duration: 300,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'La géolocalisation est requise pour utiliser cette fonctionnalité.');
        return;
      }
  
      // Obtenir la position actuelle
      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
  
      fetchWeather(location.coords.latitude, location.coords.longitude);
  
      // Activer le suivi en temps réel
      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5 },
        (location) => {
          setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
  
          // Mise à jour de la caméra pour la vue "première personne"
          if (mapRef.current) {
            mapRef.current.animateCamera({
              center: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              },
              pitch: 60, // Inclinaison pour effet 3D
              heading: location.coords.heading, // Orientation de la carte
              zoom: 18, // Zoom proche du sol
            });
          }
        }
      );
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

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`;

    try {
      const response = await axios.get(url);
      setWeather(response.data);
      await AsyncStorage.setItem('weatherData', JSON.stringify(response.data));
      await AsyncStorage.setItem('weatherTimestamp', now.toString());
    } catch (error) {
      console.error("Erreur lors de la récupération de la météo", error);
    }
  };

  //Version RainViewer
  const fetchRainViewerTiles = async () => {
      try {
          const response = await axios.get("https://api.rainviewer.com/public/weather-maps.json");
          const radarData = response.data;

          const lastRadarID = radarData.radar.past.slice(-1)[0].path;
          const tileUrl = `https://tilecache.rainviewer.com${lastRadarID}/256/{z}/{x}/{y}/2/1_1.png`;

          setRainLayerUrl(tileUrl);
      } catch (error) {
          console.error("Erreur lors du chargement des tuiles RainViewer", error);
      }
    };

    useEffect(() => {
      if (region) {  // Vérification si region est défini avant d'utiliser
        let interval;
        if (showWeather) {
          fetchWeather(region.latitude, region.longitude);
          fetchRainViewerTiles();
          interval = setInterval(() => {
            fetchWeather(region.latitude, region.longitude);
            fetchRainViewerTiles();
          }, 10 * 60 * 1000);
        }
        return () => clearInterval(interval);
      }
    }, [showWeather, region]);

  ///////////////////////////////////////////


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

    const url = `http://router.project-osrm.org/route/v1/car/${region.longitude},${region.latitude};${destinationCoords.longitude},${destinationCoords.latitude}?overview=full&geometries=polyline&steps=true`;


    try {
      const response = await axios.get(url, { headers: { "User-Agent": "BeRoadApp/1.0" } });
      console.log(response.data);
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
    moveToFirstPerson();
  };

  const getAddressSuggestions = async (query) => {
    if (query.length < 3) return []; // Ne cherche qu'après 3 lettres pour éviter trop de requêtes
  
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=fr`,
        { headers: { "User-Agent": "BeRoadApp/1.0" } }
      );
  
      return response.data.map((item) => ({
        label: item.display_name, // Adresse complète
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des adresses :", error);
      return [];
    }
  };
  
  const debouncedGetSuggestions = useCallback(
    debounce(async (text) => {
      if (text.length >= 3) {
        const newSuggestions = await getAddressSuggestions(text);
        setSuggestions(newSuggestions);
      }
    }, 1000), 
    []
  );

  const handleAddressChange = async (text) => {
    setDestination(text);
    setSuggestions([]); // Cache les suggestions lors de la saisie
    debouncedGetSuggestions(text);
  };


  const handleSelectAddress = (selected) => {
    setDestination(selected.label);
    setSuggestions([]); // Cache les suggestions après sélection
    getRoute();
  };

  const moveToFirstPerson = () => {
    if (mapRef.current) {
      mapRef.current.animateCamera({
        center: {
          latitude: region.latitude,
          longitude: region.longitude,
        },
        pitch: 60, // Inclinaison de la caméra pour une vue en 3D
        heading: 0, // Orientation (0 = vers le nord)
        altitude: 500, // Distance par rapport au sol
        zoom: 18, // Zoom proche du sol
      }, { duration: 1000 });
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
    <View style={styles.container}>

          {/* Affichage de la Map avec le tracé de l'itinéraire */}
          {region && (
             <View style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              <MapView 
                  style={StyleSheet.absoluteFill}
                  provider={PROVIDER_GOOGLE} 
                  initialRegion={region}
                  showsUserLocation
                  followsUserLocation
                  showsMyLocationButton
                  ref={mapRef}
                  >
                  <Marker coordinate={region} title="Votre position" >
                    <Icon name="motorbike" size={50} color="white" />
                  </Marker>
                  {route && <Polyline coordinates={route} strokeWidth={5} strokeColor="blue" />}
                  {showWeather && <UrlTile
                    urlTemplate={rainLayerUrl}
                    zIndex={999} // Assure que la couche est bien visible
                    opacity={0.6} // Réglage de la transparence
                  />}
              </MapView>
            </View>
          )}

          {/* Bouton d'activation de la météo */}
          <View style={{ position: 'absolute', top: 130, right: 10, zIndex: 10 }}>
          <TouchableOpacity
              onPress={() => {
                  const newShowWeather = !showWeather;
                  setShowWeather(newShowWeather);

                  if (newShowWeather) {
                      fetchWeather(region.latitude, region.longitude);
                      fetchRainViewerTiles(); // Recharge la couche de pluie
                  } else {
                      setRainLayerUrl(null); // Désactive la couche de pluie
                  }
              }}
          >
                <Icon 
                  name={showWeather ? 'weather-sunny-off' : 'weather-sunny'} 
                  size={50} // Taille de l'icône
                  color={showWeather ? 'black' : 'orange'} // Couleur de l'icône
                />
            </TouchableOpacity>
          </View>


          {/* Icône Spotify */}
          <View style={styles.spotifyIconContainer}>
            <TouchableOpacity
              onPress={() => {
                // Ouvre l'application Spotify si elle est installée
                Linking.openURL('spotify://')
                  .catch(() => {
                    // Si l'application Spotify n'est pas installée, ouvre la page sur le store
                    Linking.openURL('https://spotify.com')
                      .catch((err) => console.error('Erreur lors de l\'ouverture de Spotify :', err));
                  });
              }}
            >
              <Icon name="spotify" size={50} color="dark" />
            </TouchableOpacity>
          </View>

          
          {/* Affichage de la météo */}
          {showWeather && weather && weather.weather && weather.weather[0].icon && (
            <View style={styles.weatherContainer}>
              <View style={styles.weatherContent}>
                {/* Icône météo dynamique */}
                <Image 
                  source={{ uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png` }} 
                  style={styles.weatherIcon} 
                />
                <View>
                  <Text style={styles.weatherText}> 
                    {Math.floor(weather.main.temp)}°C 
                  </Text>
                  
                  <Text style={styles.weatherDesc}>{weather.weather[0].description}</Text>
                </View>
              </View>
            </View>
          )}

        {/* Barre de recherche dépliable/repliable */}
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View
            style={{
              height: panelHeight,
              backgroundColor: '#f0f0f0',
              padding: 10,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }}
            
          >
            <View style={{ height: 20, alignItems: 'center' }}
            {...panResponder.panHandlers}>
              <View style={{ width: 50, height: 5, backgroundColor: 'gray', borderRadius: 5, marginBottom: 10 }} />
            </View>

            <View style={styles.searchBarContainer}>
              {/* Icône à gauche */}
              <Icon name="map-search" size={20} color="#888" style={styles.icon} />
              
              {/* Champ de texte pour la destination */}
              <TextInput
                style={styles.searchInput}
                placeholder="Entrez votre destination"
                placeholderTextColor="gray"  //  olorer le texte du placeholder en noir
                value={destination}
                onChangeText={handleAddressChange}
              />
            </View>


            {/* Liste défilante des suggestions */}
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => {
                // Séparation de l'adresse par virgule
                const addressParts = item.label.split(',');

                // Récupération du numéro et de la rue
                const streetNumberAndName = addressParts[0]?.trim();
                const street = streetNumberAndName ? streetNumberAndName.replace(/^\d+\s/, '') : '';  // Enlève le numéro si présent

                // Récupération de la ville
                const city = addressParts[2]?.trim();

                // Récupération du département
                const department = addressParts[4]?.trim(); // Le département semble être à l'index 4

                return (
                  <TouchableOpacity
                    style={{
                      padding: 10,
                      backgroundColor: "#f0f0f0", // Utilisation du même fond que le panneau
                    }}
                    onPress={() => handleSelectAddress(item)}
                  >
                    <Text style={styles.suggestionText}>
                        {street}, {city}, {department}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              style={{
                marginTop: 20, 
                width: '100%',  
              }}
              ItemSeparatorComponent={() => (
                <View style={{ height: 1, backgroundColor: '#ddd', marginHorizontal: 10 }} />
              )}
            />

          </Animated.View>
        </View>
    
    </View>
  );
};

export default Ride;

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'column', alignItems: 'center', padding: 10, backgroundColor: '#fff' },
  input: { width: '90%', height: 40, borderColor: '#ccc', borderWidth: 1, paddingHorizontal: 8, borderRadius: 5, marginBottom: 10 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '90%' },
  icon: {
    marginRight: 10, // Espace entre l'icône et le champ de texte
  },
  
  //Icone spotify
  spotifyIconContainer: {
    position: 'absolute',
    top: 60,
    right:2, // Alignement à gauche
    backgroundColor: 'rgba(0, 0, 0, 0)', // Fond semi-transparent
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  //KPI météo dynamique
  weatherContainer: {
    position: 'absolute',
    top: 50, 
    left: 10,  // Positionnement en haut à gauche
    backgroundColor: 'rgba(0, 0, 0, 0)', // Fond semi-transparent
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',  // Disposition horizontale (icône + texte)
    alignItems: 'center',
    minWidth: 120, // Largeur fixe
  },
  weatherContent: {
    flexDirection: 'row',  // Alignement horizontal (icône à gauche, texte à droite)
    alignItems: 'center',  // Alignement vertical centré
  },
  weatherIcon: {
    width: 40, // Taille de l'icône
    height: 40, 
    marginRight: 5, // Espacement entre l'icône et le texte
  },
  weatherText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',  // Texte blanc pour contraster
  },
  weatherDesc: {
    fontSize: 16,
    color: '#ccc', // Couleur plus claire pour la description
  },

  // Barre de recherche et bouton Y Aller
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    //backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,  // Pour l'effet de l'ombre sur Android
    marginTop: 20,
    marginBottom: 20,
    width: '100%',
  },
  searchInput: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingLeft: 10,
    fontSize: 16,
    
  },

  // Liste des suggestions
  suggestionList: {
    width : '100%',
    position: 'absolute',
    top: 100,
    left: 15,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    maxHeight: 150,
    marginTop: 5,
    zIndex: 1000,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  suggestionText: {
    fontSize: 16,  
    color: "#333",  
    fontWeight: '600',  
    lineHeight: 24,  
  }

  
});
