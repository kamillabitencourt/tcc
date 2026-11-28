import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  Linking
} from 'react-native';

import * as Location from 'expo-location';

import {
  doc,
  setDoc
} from 'firebase/firestore';

import {
  auth,
  db
} from '../firebase/firebaseConfig';

export default function LocationScreen() {

  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    let subscription;

    const startTracking = async () => {

      try {

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          alert('Permissão de localização negada');
          return;
        }

        subscription =
          await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000,
              distanceInterval: 5
            },

            async (location) => {

              const currentCoords =
                location.coords;

              setCoords(currentCoords);

              try {

                const reverse =
                  await Location.reverseGeocodeAsync({
                    latitude: currentCoords.latitude,
                    longitude: currentCoords.longitude
                  });

                if (reverse.length > 0) {

                  const local = reverse[0];

                  setAddress(
                    `${local.street || ''}, ${local.city || ''}, ${local.region || ''}`
                  );

                }

              } catch (e) {
                console.log(e);
              }

              const user =
                auth.currentUser;

              if (user) {

                await setDoc(
                  doc(
                    db,
                    'locations',
                    user.uid
                  ),
                  {
                    latitude: currentCoords.latitude,
                    longitude: currentCoords.longitude,
                    speed: currentCoords.speed,
                    heading: currentCoords.heading,
                    altitude: currentCoords.altitude,
                    updatedAt: new Date().toISOString()
                  },
                  { merge: true }
                );

              }

              setLoading(false);

            }
          );

      } catch (error) {

        console.log(error);

      }

    };

    startTracking();

    return () => {

      if (subscription) {
        subscription.remove();
      }

    };

  }, []);

  const shareLocation = async () => {

    if (!coords) return;

    const mapsLink =
      `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;

    try {

      await Share.share({
        message:
          `Minha localização atual:\n${mapsLink}`
      });

    } catch (error) {

      console.log(error);

    }

  };

  const openInMaps = () => {

    if (!coords) return;

    const mapsLink =
      `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;

    Linking.openURL(mapsLink);

  };

  if (loading) {

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Obtendo localização...</Text>
      </View>
    );

  }

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        📍 Localização Atual
      </Text>

      <View style={styles.card}>

        <Text style={styles.info}>
          Latitude:
        </Text>

        <Text style={styles.value}>
          {coords.latitude}
        </Text>

        <Text style={styles.info}>
          Longitude:
        </Text>

        <Text style={styles.value}>
          {coords.longitude}
        </Text>

        <Text style={styles.info}>
          Endereço:
        </Text>

        <Text style={styles.value}>
          {address || 'Carregando endereço...'}
        </Text>

        <Text style={styles.info}>
          Velocidade:
        </Text>

        <Text style={styles.value}>
          {coords.speed
            ? `${coords.speed.toFixed(2)} m/s`
            : '0 m/s'}
        </Text>

        <Text style={styles.info}>
          Direção:
        </Text>

        <Text style={styles.value}>
          {coords.heading || 0}°
        </Text>

      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={openInMaps}
      >
        <Text style={styles.buttonText}>
          Abrir no Google Maps
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.shareButton}
        onPress={shareLocation}
      >
        <Text style={styles.buttonText}>
          Compartilhar Localização
        </Text>
      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f6f3a',
    marginBottom: 20
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 4,
    marginBottom: 20
  },

  info: {
    fontSize: 14,
    color: '#777',
    marginTop: 10
  },

  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000'
  },

  button: {
    backgroundColor: '#1f6f3a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10
  },

  shareButton: {
    backgroundColor: '#0f4f8a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }

});