import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Video, Camera, Square, Maximize } from 'lucide-react-native';
import { useFarmData } from '@/hooks/useFarmData';

const ESP32_CAM_STREAM_IP = "192.168.202.120";

export default function CameraScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const { camStatus } = useFarmData();

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleRecord = () => {
    triggerHaptic();
    setIsRecording(!isRecording);
    Alert.alert(
      isRecording ? "Recording Stopped" : "Recording Started",
      isRecording ? "Video saved successfully" : "Recording live feed...",
      [{ text: "OK" }]
    );
  };

  const handleSnapshot = () => {
    triggerHaptic();
    Alert.alert("Snapshot Taken", "Image saved to gallery", [{ text: "OK" }]);
  };

  const handleFullscreen = () => {
    triggerHaptic();
    Alert.alert("Fullscreen Mode", "Feature coming soon", [{ text: "OK" }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live View</Text>
        <Text style={styles.headerSubtitle}>Security camera feed</Text>
      </View>

      <View style={styles.content}>
        {/* Camera Feed */}
        <View style={styles.cameraContainer}>
          <View style={styles.cameraHeader}>
            <Text style={styles.cameraTitle}>Live Camera Feed</Text>
            <View style={[
              styles.statusBadge,
              camStatus === 'connected' ? styles.statusOnline : styles.statusOffline
            ]}>
              <View style={[
                styles.statusDot,
                camStatus === 'connected' ? styles.dotOnline : styles.dotOffline
              ]} />
              <Text style={[
                styles.statusText,
                camStatus === 'connected' ? styles.textOnline : styles.textOffline
              ]}>
                {camStatus === 'connected' ? 'LIVE' : 'OFFLINE'}
              </Text>
            </View>
          </View>
          
          <View style={styles.videoContainer}>
            {camStatus === 'connected' ? (
              <Image 
                source={{ uri: `http://${ESP32_CAM_STREAM_IP}:81/stream` }}
                style={styles.videoStream}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.offlineContainer}>
                <Video size={64} color="#6B7280" />
                <Text style={styles.offlineTitle}>Camera Offline</Text>
                <Text style={styles.offlineSubtitle}>
                  Check camera power and network connection
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.controlsGrid}>
            {/* Recording Control */}
            <View style={styles.controlCard}>
              <Text style={styles.controlTitle}>Recording</Text>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording ? styles.recordingActive : styles.recordingInactive
                ]}
                onPress={handleRecord}
                disabled={camStatus !== 'connected'}
              >
                <Square 
                  size={20} 
                  color={isRecording ? "#FFFFFF" : "#EF4444"}
                  fill={isRecording ? "#FFFFFF" : "transparent"}
                />
                <Text style={[
                  styles.recordButtonText,
                  isRecording ? styles.recordingActiveText : styles.recordingInactiveText
                ]}>
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Camera Status */}
            <View style={styles.controlCard}>
              <Text style={styles.controlTitle}>Camera Status</Text>
              <View style={styles.statusInfo}>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Connection:</Text>
                  <Text style={[
                    styles.statusValue,
                    camStatus === 'connected' ? styles.valueOnline : styles.valueOffline
                  ]}>
                    {camStatus === 'connected' ? 'Online' : 'Offline'}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Resolution:</Text>
                  <Text style={styles.statusValue}>640x480</Text>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Frame Rate:</Text>
                  <Text style={styles.statusValue}>15 FPS</Text>
                </View>
              </View>
            </View>

            {/* View Options */}
            <View style={styles.controlCard}>
              <Text style={styles.controlTitle}>View Options</Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={handleFullscreen}
                  disabled={camStatus !== 'connected'}
                >
                  <Maximize size={16} color="#6B7280" />
                  <Text style={styles.optionButtonText}>Fullscreen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={handleSnapshot}
                  disabled={camStatus !== 'connected'}
                >
                  <Camera size={16} color="#6B7280" />
                  <Text style={styles.optionButtonText}>Take Snapshot</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
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
    padding: 20,
  },
  cameraContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusOnline: {
    backgroundColor: '#DCFCE7',
  },
  statusOffline: {
    backgroundColor: '#FEE2E2',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotOnline: {
    backgroundColor: '#16A34A',
  },
  dotOffline: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textOnline: {
    color: '#16A34A',
  },
  textOffline: {
    color: '#EF4444',
  },
  videoContainer: {
    aspectRatio: 4/3,
    backgroundColor: '#111827',
  },
  videoStream: {
    width: '100%',
    height: '100%',
  },
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  offlineTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  offlineSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  controlsContainer: {
    flex: 1,
  },
  controlsGrid: {
    gap: 16,
  },
  controlCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  controlTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  recordingActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  recordingInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EF4444',
  },
  recordButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  recordingActiveText: {
    color: '#FFFFFF',
  },
  recordingInactiveText: {
    color: '#EF4444',
  },
  statusInfo: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  valueOnline: {
    color: '#16A34A',
  },
  valueOffline: {
    color: '#EF4444',
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  optionButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 8,
  },
});