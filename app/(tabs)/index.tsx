import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  RefreshControl, 
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Thermometer, Droplets, Sun, Cloud, RefreshCw, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Leaf, Chrome as Home, Wind, Shield } from 'lucide-react-native';
import { DashboardCard } from '@/components/DashboardCard';
import { StatusBadge } from '@/components/StatusBadge';
import { AlertCard } from '@/components/AlertCard';
import { useFarmData } from '@/hooks/useFarmData';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { 
    sensorData, 
    esp32Status, 
    camStatus, 
    alerts, 
    lastUpdate, 
    fetchData 
  } = useFarmData();

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    triggerHaptic();
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const systemHealth = esp32Status === 'connected' && camStatus === 'connected' 
    ? 'excellent' 
    : esp32Status === 'connected' || camStatus === 'connected' 
    ? 'good' 
    : 'poor';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Leaf size={24} color="#FFFFFF" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>AgriSmart</Text>
            <Text style={styles.subtitle}>Farm Monitor</Text>
          </View>
        </View>
        <StatusBadge status={systemHealth} />
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
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw 
              size={20} 
              color="#FFFFFF" 
              style={refreshing ? { transform: [{ rotate: '180deg' }] } : {}}
            />
            <Text style={styles.refreshButtonText}>
              {refreshing ? 'Updating...' : 'Refresh Data'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Active Alerts</Text>
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </View>
        )}

        {/* Sensor Data */}
        {sensorData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌱 Current Conditions</Text>
            <View style={styles.grid}>
              <DashboardCard
                title="Temperature"
                value={`${sensorData.insideTemp}°C`}
                icon={<Thermometer size={24} color="#EF4444" />}
                color="#FEF2F2"
                borderColor="#FECACA"
                trend={sensorData.insideTemp > 25 ? 'up' : 'down'}
              />
              <DashboardCard
                title="Soil Moisture"
                value={`${sensorData.moisture}%`}
                icon={<Droplets size={24} color="#3B82F6" />}
                color="#EFF6FF"
                borderColor="#BFDBFE"
                trend={sensorData.moisture > 50 ? 'up' : 'down'}
              />
              <DashboardCard
                title="Humidity"
                value={`${sensorData.insideHumidity}%`}
                icon={<Cloud size={24} color="#06B6D4" />}
                color="#ECFEFF"
                borderColor="#A5F3FC"
                trend="stable"
              />
              <DashboardCard
                title="Light Level"
                value={sensorData.light}
                icon={<Sun size={24} color="#EAB308" />}
                color="#FFFBEB"
                borderColor="#FDE68A"
                trend="stable"
              />
            </View>
          </View>
        )}

        {/* System Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 System Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Shield size={20} color="#16A34A" />
                <Text style={styles.statusTitle}>Farm Controller</Text>
              </View>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: esp32Status === 'connected' ? '#10B981' : '#EF4444' }
              ]} />
              <Text style={styles.statusText}>
                {esp32Status === 'connected' ? 'Online' : 'Offline'}
              </Text>
            </View>
            
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Home size={20} color="#16A34A" />
                <Text style={styles.statusTitle}>Security Camera</Text>
              </View>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: camStatus === 'connected' ? '#10B981' : '#EF4444' }
              ]} />
              <Text style={styles.statusText}>
                {camStatus === 'connected' ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>

        {/* Automation Status */}
        {sensorData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Automation</Text>
            <View style={styles.automationGrid}>
              <View style={styles.automationCard}>
                <Droplets 
                  size={24} 
                  color={sensorData.valve === 1 ? '#10B981' : '#6B7280'} 
                />
                <Text style={styles.automationTitle}>Water Valve</Text>
                <Text style={[
                  styles.automationStatus,
                  { color: sensorData.valve === 1 ? '#10B981' : '#6B7280' }
                ]}>
                  {sensorData.valve === 1 ? 'Active' : 'Inactive'}
                </Text>
              </View>
              
              <View style={styles.automationCard}>
                <Wind 
                  size={24} 
                  color={sensorData.fan === 1 ? '#10B981' : '#6B7280'} 
                />
                <Text style={styles.automationTitle}>Cooling Fan</Text>
                <Text style={[
                  styles.automationStatus,
                  { color: sensorData.fan === 1 ? '#10B981' : '#6B7280' }
                ]}>
                  {sensorData.fan === 1 ? 'Running' : 'Stopped'}
                </Text>
              </View>
              
              <View style={styles.automationCard}>
                <Home 
                  size={24} 
                  color={sensorData.shed === 1 ? '#10B981' : '#6B7280'} 
                />
                <Text style={styles.automationTitle}>Shed Door</Text>
                <Text style={[
                  styles.automationStatus,
                  { color: sensorData.shed === 1 ? '#10B981' : '#6B7280' }
                ]}>
                  {sensorData.shed === 1 ? 'Open' : 'Closed'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Farm Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚜 Farm Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>Smart Greenhouse</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Area:</Text>
              <Text style={styles.infoValue}>250 m²</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Crop Type:</Text>
              <Text style={styles.infoValue}>Mixed Vegetables</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Season:</Text>
              <Text style={styles.infoValue}>Growing</Text>
            </View>
          </View>
        </View>

        {lastUpdate && (
          <View style={styles.lastUpdate}>
            <Text style={styles.lastUpdateText}>
              Last updated: {lastUpdate.toLocaleString()}
            </Text>
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickActions: {
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
    minHeight: 52,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  automationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  automationCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: '30%',
    flex: 1,
  },
  automationTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  automationStatus: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
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
  lastUpdate: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#6B7280',
  },
});