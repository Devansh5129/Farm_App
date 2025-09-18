import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TriangleAlert as AlertTriangle, Info } from 'lucide-react-native';

interface Alert {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
}

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const isInfo = alert.type === 'info';
  const IconComponent = isInfo ? Info : AlertTriangle;
  const iconColor = isInfo ? '#3B82F6' : '#F59E0B';
  
  return (
    <View style={[styles.alertCard, isInfo && styles.infoCard]}>
      <IconComponent size={20} color={iconColor} style={styles.alertIcon} />
      <View style={styles.alertContent}>
        <Text style={[styles.alertMessage, isInfo && styles.infoMessage]}>{alert.message}</Text>
        <Text style={[styles.alertTimestamp, isInfo && styles.infoTimestamp]}>{alert.timestamp.toLocaleTimeString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderLeftColor: '#3B82F6',
    borderColor: '#BFDBFE',
  },
  alertIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
    lineHeight: 18,
  },
  alertTimestamp: {
    fontSize: 12,
    color: '#D97706',
  },
  infoMessage: {
    color: '#1E40AF',
  },
  infoTimestamp: {
    color: '#3B82F6',
  },
});