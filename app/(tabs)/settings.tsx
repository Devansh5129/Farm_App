import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Switch,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Settings, Thermometer, Droplets, Wifi, Bell, Shield, Save } from 'lucide-react-native';
import { useFarmData } from '@/hooks/useFarmData';

const ESP32_API_IP = "192.168.202.52";
const ESP32_CAM_STREAM_IP = "192.168.202.120";

export default function SettingsScreen() {
  const { currentThresholds, fetchData, setEsp32Status } = useFarmData();
  const [temp, setTemp] = useState('30.0');
  const [moist, setMoist] = useState('40');
  const [isUpdating, setIsUpdating] = useState(false);
  const [tempAlerts, setTempAlerts] = useState(true);
  const [moistAlerts, setMoistAlerts] = useState(true);

  useEffect(() => {
    setTemp(currentThresholds.temp);
    setMoist(currentThresholds.moist);
  }, [currentThresholds]);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleUpdate = async () => {
    triggerHaptic();
    setIsUpdating(true);
    try {
      const response = await fetch(`http://${ESP32_API_IP}/set?temp=${temp}&moist=${moist}`);
      if (response.ok) {
        Alert.alert("Success", "Settings updated successfully!", [{ text: "OK" }]);
        fetchData();
      } else {
        Alert.alert("Error", "Failed to update settings", [{ text: "OK" }]);
        setEsp32Status('disconnected');
      }
    } catch (error) {
      Alert.alert("Error", "Connection failed", [{ text: "OK" }]);
      setEsp32Status('disconnected');
    }
    setIsUpdating(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Configure system parameters</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Automation Thresholds */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color="#16A34A" />
            <Text style={styles.sectionTitle}>Automation Thresholds</Text>
          </View>
          
          <View style={styles.settingsCard}>
            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Thermometer size={20} color="#EF4444" />
                <Text style={styles.inputLabel}>Temperature Threshold (°C)</Text>
              </View>
              <TextInput
                style={styles.input}
                value={temp}
                onChangeText={setTemp}
                keyboardType="numeric"
                placeholder="Enter temperature"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.inputHelper}>
                Fan activates when temperature exceeds this value
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Droplets size={20} color="#3B82F6" />
                <Text style={styles.inputLabel}>Soil Moisture Threshold (%)</Text>
              </View>
              <TextInput
                style={styles.input}
                value={moist}
                onChangeText={setMoist}
                keyboardType="numeric"
                placeholder="Enter moisture level"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.inputHelper}>
                Water valve activates when moisture falls below this level
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.updateButton, isUpdating && styles.updateButtonDisabled]}
              onPress={handleUpdate}
              disabled={isUpdating}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.updateButtonText}>
                {isUpdating ? 'Updating...' : 'Update Settings'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Current Configuration</Text>
          
          <View style={styles.configGrid}>
            <View style={styles.configCard}>
              <View style={styles.configIcon}>
                <Thermometer size={24} color="#EF4444" />
              </View>
              <Text style={styles.configLabel}>Temperature Limit</Text>
              <Text style={styles.configValue}>{currentThresholds.temp}°C</Text>
              <Text style={styles.configDescription}>Cooling activation point</Text>
            </View>
            
            <View style={styles.configCard}>
              <View style={styles.configIcon}>
                <Droplets size={24} color="#3B82F6" />
              </View>
              <Text style={styles.configLabel}>Moisture Minimum</Text>
              <Text style={styles.configValue}>{currentThresholds.moist}%</Text>
              <Text style={styles.configDescription}>Irrigation trigger point</Text>
            </View>
          </View>

          <View style={styles.statusCard}>
            <Shield size={20} color="#16A34A" />
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>System Status</Text>
              <Text style={styles.statusDescription}>
                Automation is active and monitoring your farm conditions 24/7
              </Text>
            </View>
          </View>
        </View>

        {/* Alert Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Alert Notifications</Text>
          </View>
          
          <View style={styles.settingsCard}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Thermometer size={16} color="#EF4444" />
                <Text style={styles.switchText}>Temperature alerts</Text>
              </View>
              <Switch
                value={tempAlerts}
                onValueChange={(value) => {
                  triggerHaptic();
                  setTempAlerts(value);
                }}
                trackColor={{ false: '#E5E7EB', true: '#16A34A' }}
                thumbColor={tempAlerts ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>
            
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Droplets size={16} color="#3B82F6" />
                <Text style={styles.switchText}>Moisture alerts</Text>
              </View>
              <Switch
                value={moistAlerts}
                onValueChange={(value) => {
                  triggerHaptic();
                  setMoistAlerts(value);
                }}
                trackColor={{ false: '#E5E7EB', true: '#16A34A' }}
                thumbColor={moistAlerts ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* Network Configuration */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wifi size={20} color="#6366F1" />
            <Text style={styles.sectionTitle}>Network Configuration</Text>
          </View>
          
          <View style={styles.networkCard}>
            <View style={styles.networkRow}>
              <Text style={styles.networkLabel}>Controller IP:</Text>
              <Text style={styles.networkValue}>{ESP32_API_IP}</Text>
            </View>
            <View style={styles.networkRow}>
              <Text style={styles.networkLabel}>Camera IP:</Text>
              <Text style={styles.networkValue}>{ESP32_CAM_STREAM_IP}</Text>
            </View>
            <View style={styles.networkRow}>
              <Text style={styles.networkLabel}>Update Interval:</Text>
              <Text style={styles.networkValue}>3 seconds</Text>
            </View>
            <View style={styles.networkRow}>
              <Text style={styles.networkLabel}>Status Check:</Text>
              <Text style={styles.networkValue}>10 seconds</Text>
            </View>
          </View>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ App Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version:</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Platform:</Text>
              <Text style={styles.infoValue}>React Native</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build:</Text>
              <Text style={styles.infoValue}>Production</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 52,
  },
  inputHelper: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 16,
  },
  updateButton: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  updateButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  configGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  configCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  configIcon: {
    marginBottom: 8,
  },
  configLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  configValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  configDescription: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#ECFDF5',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statusTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#15803D',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: '#16A34A',
    lineHeight: 18,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 8,
  },
  networkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  networkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  networkLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  networkValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
});