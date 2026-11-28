import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = 'userProfile';

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');   

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const json = await AsyncStorage.getItem(PROFILE_KEY);
        if (json) {
          const data = JSON.parse(json);
          setName(data.name || '');
          setAvatar(data.avatar || 'https://img.freepik.com/vetores-premium/icone-de-perfil-de-avatar-padrao-imagem-de-usuario-de-midia-social-icone-de-avatar-cinza-silhueta-de-perfil-em-branco-ilustracao-vetorial_561158-3383.jpg?semt=ais_hybrid&w=740');
        } else {
          // se não tem nada salvo, define a URL padrão já aqui
          setAvatar('https://img.freepik.com/vetores-premium/icone-de-perfil-de-avatar-padrao-imagem-de-usuario-de-midia-social-icone-de-avatar-cinza-silhueta-de-perfil-em-branco-ilustracao-vetorial_561158-3383.jpg?semt=ais_hybrid&w=740');
        }
      } catch (e) {
        console.log('Erro ao carregar perfil:', e);
      }
    };
    loadProfile();
  }, []);

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome não pode ficar vazio.');
      return;
    }
    try {
      const data = { name, avatar };
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(data));
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar o perfil.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Imagem de Perfil:</Text>
      <Image
        source={{ uri: avatar }}
        style={styles.avatar}
        resizeMode="contain"
      />

      <Text style={styles.label}>Nome:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>URL do Avatar:</Text>
      <TextInput
        style={styles.input}
        value={avatar}
        onChangeText={setAvatar}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity style={styles.button} onPress={saveProfile}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e6f0e6',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    color: '#1f6f3a',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginTop: 4,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginVertical: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#1f6f3a',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
