import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';

import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/auth';

export default function ForgotPasswordScreen({ navigation }) {

  const [email, setEmail] = useState('');

  const handleReset = async () => {

    if (!email.trim()) {
      Alert.alert(
        'Erro',
        'Informe um e-mail.'
      );
      return;
    }

    try {

      await sendPasswordResetEmail(
        auth,
        email
      );

      Alert.alert(
        'Sucesso',
        'Email de recuperação enviado.'
      );

      navigation.goBack();

    } catch (error) {

      Alert.alert(
        'Erro',
        error.message
      );

    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Recuperar Senha
      </Text>

      <Text style={styles.subtitle}>
        Informe seu e-mail para redefinir a senha
      </Text>

      <Text style={styles.label}>
        E-mail
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleReset}
      >
        <Text style={styles.buttonText}>
          Enviar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>
          Voltar ao login
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f0e6',
    justifyContent: 'center',
    padding: 24
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 24
  },
  label: {
    fontSize: 14,
    marginBottom: 6
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 20
  },
  button: {
    backgroundColor: '#1f6f3a',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  backText: {
    color: '#1f6f3a',
    textAlign: 'center'
  }
});