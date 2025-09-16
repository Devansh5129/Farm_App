import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface SensorGaugeProps {
  title: string;
  value: number;
  unit: string;
  max: number;
  threshold?: number;
  color: string;
  reverse?: boolean;
}

export function SensorGauge({ title, value, unit, max, threshold, color, reverse = false }: SensorGaugeProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const isAlert = threshold && (reverse ? value < threshold : value > threshold);
  
  const strokeColor = isAlert ? '#EF4444' : color;
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.gaugeContainer}>
        <Svg width="100" height="100" style={styles.svg}>
          <Circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#F3F4F6"
            strokeWidth="8"
            fill="none"
          />
          <Circle
            cx="50"
            cy="50"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.gaugeContent}>
          <Text style={[styles.value, isAlert && styles.alertValue]}>{value}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>
      {threshold && (
        <View style={styles.thresholdContainer}>
          <Text style={styles.thresholdText}>Threshold: {threshold}{unit}</Text>
          {isAlert && <Text style={styles.alertText}>Alert!</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 120,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  gaugeContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  gaugeContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  alertValue: {
    color: '#EF4444',
  },
  unit: {
    fontSize: 12,
    color: '#6B7280',
  },
  thresholdContainer: {
    alignItems: 'center',
  },
  thresholdText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  alertText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 2,
  },
});