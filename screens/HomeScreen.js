// HomeScreen.js — atualizado para mostrar status da bengala e navegar para BengalaScreen

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const INTEGRATIONS_KEY = 'selectedIntegrations';
const PROFILE_KEY = 'userProfile';
const ESP_IP_KEY = 'esp32_ip';
const API_KEY = 'SUA_API_KEY_OPENWEATHERMAP';

const DEFAULT_AVATAR = 'https://img.freepik.com/vetores-premium/icone-de-perfil-de-avatar-padrao-imagem-de-usuario-de-midia-social-icone-de-avatar-cinza-silhueta-de-perfil-em-branco-ilustracao-vetorial_561158-3383.jpg?semt=ais_hybrid&w=740';

export default function HomeScreen({ navigation }) {
    const [selectedIntegrations, setSelectedIntegrations] = useState({
        whatsapp: true,
        moovit: true,
        bemyeyes: true,
    });

    const [user, setUser] = useState({ name: '', avatar: DEFAULT_AVATAR, status: '' });
    const [weather, setWeather] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(true);
    const intervalRef = useRef(null);

    // ── Bengala: status resumido na Home ──────────────
    const [bengalaStatus, setBengalaStatus] = useState(null); // null = desconectada
    const bengalaRef = useRef(null);

    const checkBengalaStatus = useCallback(async () => {
        try {
            const savedIp = await AsyncStorage.getItem(ESP_IP_KEY);
            if (!savedIp) return;
            const res = await fetch(`http://${savedIp}/status`, { signal: AbortSignal.timeout(2000) });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setBengalaStatus(data);

            // Alerta de SOS na home também
            if (data.sos_triggered) {
                Alert.alert('🆘 SOS Acionado!', 'O botão de emergência da bengala foi pressionado!', [{ text: 'OK' }]);
            }
        } catch {
            setBengalaStatus(null);
        }
    }, []);

    // Verifica bengala quando a tela ganha foco
    useFocusEffect(
        useCallback(() => {
            checkBengalaStatus();
            bengalaRef.current = setInterval(checkBengalaStatus, 5000); // a cada 5s
            return () => clearInterval(bengalaRef.current);
        }, [checkBengalaStatus])
    );
    // ─────────────────────────────────────────────────

    useFocusEffect(
        useCallback(() => {
            const loadIntegrations = async () => {
                try {
                    const value = await AsyncStorage.getItem(INTEGRATIONS_KEY);
                    if (value) setSelectedIntegrations(JSON.parse(value));
                } catch (e) {
                    console.log('Erro ao carregar integrações:', e);
                }
            };
            loadIntegrations();
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            const loadUserProfile = async () => {
                try {
                    const json = await AsyncStorage.getItem(PROFILE_KEY);
                    if (json) {
                        const data = JSON.parse(json);
                        setUser({ name: data.name || '', avatar: data.avatar || DEFAULT_AVATAR, status: data.status || '' });
                    } else {
                        setUser({ name: '', avatar: DEFAULT_AVATAR, status: '' });
                    }
                } catch (e) {
                    console.log('Erro ao carregar perfil:', e);
                }
            };
            loadUserProfile();
        }, [])
    );

    const getLocationAndFetchWeather = async () => {
        try {
            setLoadingWeather(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'Precisamos da permissão para acessar sua localização.');
                setLoadingWeather(false);
                return;
            }
            const loc = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = loc.coords;
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=pt_br&appid=${API_KEY}`
            );
            const data = await response.json();
            setWeather(data);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível obter o clima.');
        } finally {
            setLoadingWeather(false);
        }
    };

    useEffect(() => {
        getLocationAndFetchWeather();
        intervalRef.current = setInterval(getLocationAndFetchWeather, 300000);
        return () => clearInterval(intervalRef.current);
    }, []);

    const openMaps = () => Linking.openURL('https://www.google.com/maps');
    const openWhatsApp = () => Linking.openURL('https://wa.me/');
    const openMoovit = () => Linking.openURL('moovit://');
    const openBeMyEyes = () => Linking.openURL('bemyeyes://');

    // ── Bengala: cor e texto do status ───────────────
    const bengalaConnected = !!bengalaStatus;
    const bengalaObstacle = bengalaStatus?.obstacle_detected;
    const bengalaStatusText = !bengalaConnected
        ? 'Não conectada'
        : bengalaObstacle
        ? `⚠️ Obstáculo a ${bengalaStatus.distance_cm}cm!`
        : `Conectada · ${bengalaStatus.distance_cm > 0 ? bengalaStatus.distance_cm + 'cm livre' : 'OK'}`;

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Perfil */}
            <View style={styles.profileContainer}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                <View style={styles.profileInfo}>
                    <Text style={styles.userName}>{user.name || 'Usuário'}</Text>
                </View>
                <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')} accessibilityLabel="Editar perfil">
                    <MaterialIcons name="edit" size={24} color="#1f6f3a" />
                </TouchableOpacity>
            </View>

            {/* Clima */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>☀️ Clima Atual</Text>
                {loadingWeather ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ActivityIndicator size="small" color="#1f6f3a" />
                        <Text style={[styles.sectionContent, { marginLeft: 10 }]}>Carregando clima...</Text>
                    </View>
                ) : weather && weather.cod === 200 ? (
                    <>
                        <Text style={styles.sectionContent}>{weather.main.temp.toFixed(1)}°C - {weather.weather[0].description}</Text>
                        <Text style={[styles.sectionContent, { fontSize: 14, color: '#555' }]}>{weather.name}</Text>
                    </>
                ) : (
                    <Text style={styles.sectionContent}>Não foi possível carregar o clima.</Text>
                )}
            </View>

            {/* Localização */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📍 Localização</Text>
                <TouchableOpacity style={styles.button} onPress={openMaps}>
                    <Text style={styles.buttonText}>Abrir no Google Maps</Text>
                </TouchableOpacity>
            </View>

            {/* Integrações */}
            <View style={styles.section}>
                <View style={styles.integrationHeader}>
                    <Text style={styles.sectionTitle}>🔗 Integrações</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')} style={styles.integrationEditButton} accessibilityLabel="Configurações de integrações">
                        <MaterialIcons name="edit" size={24} color="#1f6f3a" />
                    </TouchableOpacity>
                </View>
                {selectedIntegrations.whatsapp && (
                    <TouchableOpacity style={styles.button} onPress={openWhatsApp}>
                        <Text style={styles.buttonText}>WhatsApp</Text>
                    </TouchableOpacity>
                )}
                {selectedIntegrations.moovit && (
                    <TouchableOpacity style={styles.button} onPress={openMoovit}>
                        <Text style={styles.buttonText}>Abrir Moovit</Text>
                    </TouchableOpacity>
                )}
                {selectedIntegrations.bemyeyes && (
                    <TouchableOpacity style={styles.button} onPress={openBeMyEyes}>
                        <Text style={styles.buttonText}>Be My Eyes</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* ── Bengala Inteligente ── */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🦯 Bengala Inteligente</Text>

                {/* Status resumido */}
                <View style={[styles.bengalaStatus, { borderColor: bengalaConnected ? (bengalaObstacle ? '#e53935' : '#1f6f3a') : '#ccc' }]}>
                    <View style={[styles.dot, { backgroundColor: bengalaConnected ? (bengalaObstacle ? '#e53935' : '#4caf50') : '#bbb' }]} />
                    <Text style={[styles.sectionContent, { marginBottom: 0, color: bengalaObstacle ? '#e53935' : '#333' }]}>
                        {bengalaStatusText}
                    </Text>
                </View>

                {/* Botão para tela completa */}
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Bengala')}>
                    <Text style={styles.buttonText}>{bengalaConnected ? 'Controlar bengala' : 'Conectar bengala'}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e6f0e6', padding: 20 },
    profileContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#d9f0d9', padding: 16, borderRadius: 12, marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
    avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 16 },
    profileInfo: { flex: 1 },
    userName: { fontSize: 20, fontWeight: 'bold', color: '#1f6f3a' },
    editButton: { padding: 8 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 20, fontWeight: '600', color: '#1f6f3a', marginBottom: 8 },
    sectionContent: { fontSize: 16, color: '#000', marginBottom: 8 },
    button: { backgroundColor: '#1f6f3a', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    integrationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    integrationEditButton: { padding: 4 },
    bengalaStatus: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 8, padding: 12, marginBottom: 10, backgroundColor: '#fff', gap: 10 },
    dot: { width: 12, height: 12, borderRadius: 6 },
});