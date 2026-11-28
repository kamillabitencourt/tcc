import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert
} from 'react-native';
console.log(auth);
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/auth';

export default function LoginScreen({ navigation }) {

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {

    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        senha
      );

      navigation.replace('AppDrawer');

    } catch (error) {

      Alert.alert(
        'Erro',
        'Usuário ou senha inválidos.'
      );

    }
  };

  return (
    <View style={styles.container}>

      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
      />

      <Text style={styles.title}>Guiasense</Text>

      <Text style={styles.label}>Digite seu email</Text>

      <TextInput
        style={styles.input}
        placeholder="EMAIL"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Digite sua senha</Text>

      <TextInput
        style={styles.input}
        placeholder="SENHA"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>
          ENTRAR
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('EsqueciSenha')}
      >
        <Text style={styles.buttonText}>
          ESQUECI MINHA SENHA
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Cadastro')}
      >
        <Text style={styles.buttonText}>
          FAZER CADASTRO
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d7e3d1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 10
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 30
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    marginTop: 10
  },
  input: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: 'green',
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff'
  },
  button: {
    backgroundColor: '#236c35',
    paddingVertical: 12,
    borderRadius: 6,
    width: '100%',
    marginTop: 20,
    alignItems: 'center'
  },
  secondaryButton: {
    backgroundColor: '#236c35',
    paddingVertical: 12,
    borderRadius: 6,
    width: '100%',
    marginTop: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});