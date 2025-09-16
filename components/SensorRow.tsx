import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SensorRowProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  status?: boolean;
}

export function SensorRow({ label, value, icon, status }: SensorRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.labelContainer}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        {status !== undefined && (
          <View style={[
            styles.statusDot,
            { backgroundColor: status ? '#10B981' : '#6B7280' }
          ]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});