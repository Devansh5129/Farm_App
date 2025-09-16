import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield } from 'lucide-react-native';

interface StatusBadgeProps {
  status: 'excellent' | 'good' | 'poor';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'excellent':
        return {
          text: 'System Healthy',
          backgroundColor: '#DCFCE7',
          textColor: '#15803D',
          iconColor: '#16A34A',
        };
      case 'good':
        return {
          text: 'System Warning',
          backgroundColor: '#FEF3C7',
          textColor: '#92400E',
          iconColor: '#D97706',
        };
      case 'poor':
        return {
          text: 'System Critical',
          backgroundColor: '#FEE2E2',
          textColor: '#991B1B',
          iconColor: '#DC2626',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <Shield size={16} color={config.iconColor} />
      <Text style={[styles.text, { color: config.textColor }]}>
        {config.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});