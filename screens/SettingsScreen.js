import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { auth, db } from '../firebase/firebaseConfig';

import {
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';

const integrationsList = [
  { key: 'moovit', name: 'Moovit' },
  { key: 'bemyeyes', name: 'Be My Eyes' },
  { key: 'whatsapp', name: 'WhatsApp' }
];

const INTEGRATIONS_KEY = 'selectedIntegrations';

export default function SettingsScreen() {

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bloodType: '',
    emergencyName: '',
    emergencyPhone: '',
    visionCondition: '',
    avatar: '',
    createdAt: '',
    updatedAt: ''
  });

  const [selectedIntegrations, setSelectedIntegrations] = useState({});

  useEffect(() => {

    const loadSettings = async () => {

      try {

        const storedIntegrations =
          await AsyncStorage.getItem(INTEGRATIONS_KEY);

        if (storedIntegrations) {

          setSelectedIntegrations(
            JSON.parse(storedIntegrations)
          );

        } else {

          const initial = {};

          integrationsList.forEach(item => {
            initial[item.key] = true;
          });

          setSelectedIntegrations(initial);
        }

        const user = auth.currentUser;

        if (!user) return;

        const docRef =
          doc(db, 'users', user.uid);

        const docSnap =
          await getDoc(docRef);

        if (docSnap.exists()) {

          setProfile(docSnap.data());

        } else {

          const initialProfile = {
            name: '',
            email: user.email || '',
            phone: '',
            bloodType: '',
            emergencyName: '',
            emergencyPhone: '',
            visionCondition: '',
            avatar: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await setDoc(
            doc(db, 'users', user.uid),
            initialProfile
          );

          setProfile(initialProfile);
        }

      } catch (error) {

        console.log(error);

        Alert.alert(
          'Erro',
          'Erro ao carregar perfil'
        );

      }

    };

    loadSettings();

  }, []);

  const toggleIntegration = async (key) => {

    const updated = {
      ...selectedIntegrations,
      [key]: !selectedIntegrations[key]
    };

    setSelectedIntegrations(updated);

    try {

      await AsyncStorage.setItem(
        INTEGRATIONS_KEY,
        JSON.stringify(updated)
      );

    } catch (error) {

      console.log(error);

    }

  };

  const updateProfileField = async (
    field,
    value
  ) => {

    const updatedProfile = {
      ...profile,
      [field]: value,
      updatedAt:
        new Date().toISOString()
    };

    setProfile(updatedProfile);

    try {

      const user =
        auth.currentUser;

      if (!user) return;

      await setDoc(
        doc(db, 'users', user.uid),
        updatedProfile,
        { merge: true }
      );

    } catch (error) {

      console.log(error);

      Alert.alert(
        'Erro',
        'Não foi possível salvar'
      );

    }

  };

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
      >

        <Text style={styles.title}>
          Dados Pessoais
        </Text>

        <Image
          source={{
            uri:
              profile.avatar ||
              'https://cdn-icons-png.flaticon.com/512/149/149071.png'
          }}
          style={styles.avatar}
        />

        <TextInput
          style={styles.input}
          placeholder="URL da Foto"
          value={profile.avatar}
          onChangeText={(text) =>
            updateProfileField(
              'avatar',
              text
            )
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={profile.name}
          onChangeText={(text) =>
            updateProfileField(
              'name',
              text
            )
          }
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={profile.email}
          keyboardType="email-address"
          onChangeText={(text) =>
            updateProfileField(
              'email',
              text
            )
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Telefone"
          value={profile.phone}
          keyboardType="phone-pad"
          onChangeText={(text) =>
            updateProfileField(
              'phone',
              text
            )
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Tipo Sanguíneo"
          value={profile.bloodType}
          onChangeText={(text) =>
            updateProfileField(
              'bloodType',
              text
            )
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Contato de Emergência"
          value={profile.emergencyName}
          onChangeText={(text) =>
            updateProfileField(
              'emergencyName',
              text
            )
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Telefone de Emergência"
          value={profile.emergencyPhone}
          keyboardType="phone-pad"
          onChangeText={(text) =>
            updateProfileField(
              'emergencyPhone',
              text
            )
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Condição Visual"
          value={profile.visionCondition}
          onChangeText={(text) =>
            updateProfileField(
              'visionCondition',
              text
            )
          }
        />

        <Text
          style={[
            styles.title,
            { marginTop: 25 }
          ]}
        >
          Integrações
        </Text>

        {integrationsList.map(
          (integration) => (
            <View
              key={integration.key}
              style={styles.option}
            >
              <Text>
                {integration.name}
              </Text>

              <Switch
                value={
                  !!selectedIntegrations[
                    integration.key
                  ]
                }
                onValueChange={() =>
                  toggleIntegration(
                    integration.key
                  )
                }
              />
            </View>
          )
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f6f3a',
    marginBottom: 20
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 20
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9'
  },

  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  }

});