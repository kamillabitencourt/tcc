import React, {
  useRef,
  useState
} from 'react';

import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';

import {
  CameraView,
  useCameraPermissions
} from 'expo-camera';

export default function AIVisionScreen() {

  const cameraRef = useRef(null);

  const [loading, setLoading] =
    useState(false);

  const [permission, requestPermission] =
    useCameraPermissions();

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>
            Permitir Câmera
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tirarFoto = async () => {

    try {

      if (!cameraRef.current) {

        Alert.alert(
          "Erro",
          "Câmera não inicializada"
        );

        return;
      }

      setLoading(true);

      const photo =
        await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true
        });

      console.log("Foto capturada");

      const response =
        await fetch(
          "SUA_URL_DA_FUNCTION",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              imageBase64:
                photo.base64
            })
          }
        );

      const data =
        await response.json();

      Alert.alert(
        "Descrição do Ambiente",
        data.description
      );

    } catch (error) {

      console.log(error);

      Alert.alert(
        "Erro",
        error.message
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <View style={{ flex: 1 }}>

      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
      />

      {loading && (

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
          />
        </View>

      )}

      <TouchableOpacity
        style={styles.capture}
        onPress={tirarFoto}
      >

        <Text style={styles.captureText}>
          Capturar
        </Text>

      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  button: {
    backgroundColor: '#1f6f3a',
    padding: 15,
    borderRadius: 10
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },

  loadingContainer: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center'
  },

  capture: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#1f6f3a',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 50
  },

  captureText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }

});