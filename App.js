import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import 'react-native-gesture-handler';
import AIVisionScreen from './screens/AIVisionScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

import HomeScreen from './screens/HomeScreen';
import BengalaScreen from './screens/BengalaScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import LocationScreen from './screens/LocationScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        drawerType: 'front',
        drawerActiveTintColor: '#1f6f3a',
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Início' }}
      />

      <Drawer.Screen
        name="Bengala"
        component={BengalaScreen}
        options={{ title: 'Bengala' }}
      />

      <Drawer.Screen
        name="Localizacao"
        component={LocationScreen}
        options={{ title: 'Localização em Tempo Real' }}
      />

      <Drawer.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Editar Perfil' }}
      />

      <Drawer.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ title: 'Configurações' }}
      />
      <Drawer.Screen
        name="IA Vision"
        component={AIVisionScreen}
        options={{
    title: 'IA Assistiva'
  }}
/>
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="Cadastro"
          component={RegisterScreen}
        />

        <Stack.Screen
          name="EsqueciSenha"
          component={ForgotPasswordScreen}
        />

        <Stack.Screen
          name="AppDrawer"
          component={DrawerNavigator}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}