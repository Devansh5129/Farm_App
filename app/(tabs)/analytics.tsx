import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Thermometer, Droplets, Cloud, Sun, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useFarmData } from '@/hooks/useFarmData';
import { SensorGauge } from '@/components/SensorGauge';
import { SensorRow } from '@/components/SensorRow';

export default function AnalyticsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { sensorData, thresholds, lastUpdate, fetchData } = useFarmData();

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (!sensorData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading sensor data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Detailed sensor data and trends</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#16A34A']}
            tintColor="#16A34A"
          />
        }
      >
        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={20} color="#FFFFFF" />
            <Text style={styles.refreshButtonText}>
              {refreshing ? 'Updating...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
          {lastUpdate && (
            <Text style={styles.lastUpdateText}>
              Last updated: {lastUpdate.toLocaleString()}
            </Text>
          )}
        </View>

        {/* Environmental Monitoring */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌡️ Environmental Monitoring</Text>
          <View style={styles.gaugeGrid}>
            <SensorGauge
              title="Temperature"
              value={sensorData.insideTemp}
              unit="°C"
              max={50}
              threshold={parseFloat(thresholds.temp)}
              color="#EF4444"
            />
            <SensorGauge
              title="Soil Moisture"
              value={sensorData.moisture}
              unit="%"
              max={100}
              threshold={parseInt(thresholds.moist)}
              color="#3B82F6"
              reverse={true}
            />
            <SensorGauge
              title="Humidity"
              value={sensorData.insideHumidity}
              unit="%"
              max={100}
              color="#06B6D4"
            />
          </View>
        </View>

        {/* External Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌤️ External Conditions</Text>
          <View style={styles.sensorCard}>
            <SensorRow
              label="Outside Temperature"
              value={`${sensorData.outsideTemp}°C`}
              icon={<Thermometer size={20} color="#6B7280" />}
            />
            <SensorRow
              label="Outside Humidity"
              value={`${sensorData.outsideHumidity}%`}
              icon={<Droplets size={20} color="#6B7280" />}
            />
            <SensorRow
              label="Light Level"
              value={sensorData.light}
              icon={<Sun size={20} color="#6B7280" />}
            />
            <SensorRow
              label="Rain Detection"
              value={sensorData.rain === 1 ? "Detected" : "None"}
              icon={<Cloud size={20} color="#6B7280" />}
              status={sensorData.rain === 1}
            />
          </View>
        </View>

        {/* System Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ System Controls</Text>
          <View style={styles.sensorCard}>
            <SensorRow
              label="Water Valve"
              value={sensorData.valve === 1 ? "Active" : "Inactive"}
              icon={<Droplets size={20} color="#6B7280" />}
              status={sensorData.valve === 1}
            />
            <SensorRow
              label="Cooling Fan"
              value={sensorData.fan === 1 ? "Running" : "Stopped"}
              icon={<TrendingUp size={20} color="#6B7280" />}
              status={sensorData.fan === 1}
            />
            <SensorRow
              label="Shed Door"
              value={sensorData.shed === 1 ? "Open" : "Closed"}
              icon={<TrendingDown size={20} color="#6B7280" />}
              status={sensorData.shed === 1}
            />
          </View>
        </View>

        {/* Thresholds */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Current Thresholds</Text>
          <View style={styles.thresholdCard}>
            <View style={styles.thresholdRow}>
              <Text style={styles.thresholdLabel}>Temperature Limit</Text>
              <Text style={styles.thresholdValue}>{thresholds.temp}°C</Text>
            </View>
            <View style={styles.thresholdRow}>
              <Text style={styles.thresholdLabel}>Moisture Minimum</Text>
              <Text style={styles.thresholdValue}>{thresholds.moist}%</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
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
  controls: {
    paddingVertical: 16,
  },
  refreshButton: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  gaugeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
  },
  sensorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  thresholdCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  thresholdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  thresholdLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  thresholdValue: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: 'bold',
  },
});