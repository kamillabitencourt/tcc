import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Switch,
  Vibration,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

const ESP_IP_KEY = 'esp32_ip';
const POLL_INTERVAL = 1000; // ms — busca status a cada 1 segundo

export default function BengalaScreen() {
  const [ip, setIp] = useState('192.168.1.120');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState(null);
  const [alarmOn, setAlarmOn] = useState(false);
  const [threshold, setThreshold] = useState('80');

  const pollRef = useRef(null);
  const baseUrl = `http://${ip}`;

  // Salva/carrega IP preferido
  useEffect(() => {
    AsyncStorage.getItem(ESP_IP_KEY).then(saved => {
      if (saved) setIp(saved);
    });
  }, []);

  // Polling enquanto conectado
  useEffect(() => {
    if (connected) {
      pollRef.current = setInterval(fetchStatus, POLL_INTERVAL);
    } else {
      clearInterval(pollRef.current);
    }
    return () => clearInterval(pollRef.current);
  }, [connected, ip]);

  // ── Funções de comunicação ──────────────────────

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/status`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      setStatus(data);

      // Vibra se obstáculo detectado
      if (data.obstacle_detected) {
        Vibration.vibrate(100);
      }

      // Notifica SOS
      if (data.sos_triggered) {
        Alert.alert(
          '🆘 SOS Acionado!',
          'O botão de emergência da bengala foi pressionado!',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      // Considera desconectado após falha
      setConnected(false);
      setStatus(null);
    }
  }, [ip]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await fetch(`${baseUrl}/status`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error('Resposta inválida');
      const data = await res.json();
      if (!data.connected) throw new Error('ESP32 não respondeu corretamente');

      setStatus(data);
      setConnected(true);
      setAlarmOn(data.alarm_active);
      setThreshold(String(data.alert_threshold));
      await AsyncStorage.setItem(ESP_IP_KEY, ip);
    } catch (err) {
      Alert.alert(
        'Falha na conexão',
        `Não foi possível conectar ao ESP32 em ${ip}.\n\nVerifique:\n• Celular e ESP32 na mesma rede WiFi\n• IP correto\n• Firmware rodando`
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setStatus(null);
    setAlarmOn(false);
  };

  const toggleAlarm = async (value) => {
    setAlarmOn(value);
    try {
      await fetch(`${baseUrl}/alarm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: value }),
        signal: AbortSignal.timeout(2000),
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível alterar o alarme.');
      setAlarmOn(!value); // reverte
    }
  };

  const sendThreshold = async () => {
    const val = parseInt(threshold, 10);
    if (isNaN(val) || val < 20 || val > 400) {
      Alert.alert('Valor inválido', 'Use um valor entre 20 e 400 cm.');
      return;
    }
    try {
      await fetch(`${baseUrl}/threshold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: val }),
        signal: AbortSignal.timeout(2000),
      });
      Alert.alert('✅ Ajustado', `Limite definido para ${val} cm`);
    } catch {
      Alert.alert('Erro', 'Não foi possível ajustar o limite.');
    }
  };

  // ── Helpers de UI ───────────────────────────────

  const distanceColor = () => {
    if (!status || status.distance_cm < 0) return '#888';
    if (status.obstacle_detected) return '#e53935';
    return '#1f6f3a';
  };

  const distanceLabel = () => {
    if (!status) return '—';
    if (status.distance_cm < 0) return 'Sem leitura';
    return `${status.distance_cm} cm`;
  };

  // ── Render ──────────────────────────────────────

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>🦯 Bengala Inteligente</Text>

      {/* Painel de conexão */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Configuração WiFi</Text>
        <Text style={styles.label}>IP do ESP32</Text>
        <TextInput
          style={styles.input}
          value={ip}
          onChangeText={setIp}
          placeholder="Ex: 192.168.1.120"
          keyboardType="numeric"
          editable={!connected}
          selectTextOnFocus
        />
        {!connected ? (
          <TouchableOpacity
            style={[styles.btn, styles.btnGreen]}
            onPress={handleConnect}
            disabled={connecting}
          >
            {connecting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Conectar</Text>
            }
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.btn, styles.btnRed]} onPress={handleDisconnect}>
            <Text style={styles.btnText}>Desconectar</Text>
          </TouchableOpacity>
        )}

        {/* Indicador de status */}
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: connected ? '#4caf50' : '#bbb' }]} />
          <Text style={styles.statusText}>
            {connected ? `Conectado · ${ip}` : 'Desconectado'}
          </Text>
        </View>
      </View>

      {/* Painel de dados (visível só conectado) */}
      {connected && status && (
        <>
          {/* Distância */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sensor de Obstáculo</Text>
            <Text style={[styles.bigNumber, { color: distanceColor() }]}>
              {distanceLabel()}
            </Text>
            {status.obstacle_detected && (
              <View style={styles.alertBanner}>
                <MaterialIcons name="warning" size={20} color="#fff" />
                <Text style={styles.alertText}>Obstáculo detectado!</Text>
              </View>
            )}
          </View>

          {/* Limite de alerta */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Limite de Alerta</Text>
            <Text style={styles.label}>Distância mínima (cm)</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={threshold}
                onChangeText={setThreshold}
                keyboardType="numeric"
              />
              <TouchableOpacity style={[styles.btn, styles.btnSmall, styles.btnGreen]} onPress={sendThreshold}>
                <Text style={styles.btnText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Alarme */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Alarme Sonoro</Text>
            <View style={styles.switchRow}>
              <Text style={styles.label}>{alarmOn ? 'Alarme ATIVO' : 'Alarme desligado'}</Text>
              <Switch
                value={alarmOn}
                onValueChange={toggleAlarm}
                trackColor={{ false: '#ccc', true: '#e53935' }}
                thumbColor={alarmOn ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Info extra */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informações</Text>
            <Text style={styles.infoText}>⏱ Uptime: {status.uptime_s}s</Text>
            <Text style={styles.infoText}>
              🌐 Conectado a: {ip}
            </Text>
          </View>
        </>
      )}

      {/* Placeholder quando desconectado */}
      {!connected && (
        <View style={styles.placeholder}>
          <MaterialIcons name="bluetooth-disabled" size={48} color="#bbb" />
          <Text style={styles.placeholderText}>
            Conecte ao ESP32 via WiFi para ver os dados da bengala
          </Text>
          <Text style={styles.placeholderSub}>
            Certifique-se de que o celular e a bengala estão na mesma rede WiFi
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f0e6',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f6f3a',
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f6f3a',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  btn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSmall: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  btnGreen: {
    backgroundColor: '#1f6f3a',
  },
  btnRed: {
    backgroundColor: '#e53935',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    color: '#555',
  },
  bigNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  alertBanner: {
    backgroundColor: '#e53935',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 8,
  },
  alertText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  placeholder: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  placeholderText: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginTop: 12,
  },
  placeholderSub: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 6,
  },
});