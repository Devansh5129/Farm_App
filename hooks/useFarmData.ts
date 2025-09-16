import { useState, useEffect, useCallback } from 'react';

const ESP32_API_IP = "192.168.202.52";
const ESP32_CAM_STREAM_IP = "192.168.202.120";

interface SensorData {
  insideTemp: number;
  outsideTemp: number;
  insideHumidity: number;
  outsideHumidity: number;
  moisture: number;
  light: string;
  rain: number;
  valve: number;
  fan: number;
  shed: number;
}

interface Alert {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
}

interface Thresholds {
  temp: string;
  moist: string;
}

export function useFarmData() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [esp32Status, setEsp32Status] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [camStatus, setCamStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [thresholds, setThresholds] = useState<Thresholds>({ temp: '30.0', moist: '40' });
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const checkStatus = useCallback(async () => {
    // Check ESP32 API status
    try {
      const response = await fetch(`http://${ESP32_API_IP}/status`);
      setEsp32Status(response.ok ? 'connected' : 'disconnected');
    } catch (error) {
      setEsp32Status('disconnected');
    }

    // Check camera status
    try {
      const img = new Image();
      let timeout = setTimeout(() => {
        setCamStatus('disconnected');
        img.src = '';
      }, 10000);

      img.onload = () => {
        setCamStatus('connected');
        clearTimeout(timeout);
      };
      img.onerror = () => {
        setCamStatus('disconnected');
        clearTimeout(timeout);
      };
      img.src = `http://${ESP32_CAM_STREAM_IP}:81/stream`;
    } catch (error) {
      setCamStatus('disconnected');
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (esp32Status !== 'connected') return;
    
    try {
      const response = await fetch(`http://${ESP32_API_IP}/data`);
      const data = await response.json();
      
      setSensorData(data.sensors);
      setThresholds(data.thresholds);
      setLastUpdate(new Date());
      
      // Generate alerts
      const newAlerts: Alert[] = [];
      if (data.sensors.insideTemp > parseFloat(data.thresholds.temp)) {
        newAlerts.push({
          id: 'temp-high',
          type: 'warning',
          message: `High temperature detected: ${data.sensors.insideTemp}°C`,
          timestamp: new Date()
        });
      }
      if (data.sensors.moisture < parseInt(data.thresholds.moist)) {
        newAlerts.push({
          id: 'moisture-low',
          type: 'warning',
          message: `Low soil moisture: ${data.sensors.moisture}%`,
          timestamp: new Date()
        });
      }
      setAlerts(newAlerts);
      
    } catch (error) {
      console.error("Failed to fetch sensor data:", error);
      setEsp32Status('disconnected');
    }
  }, [esp32Status]);

  useEffect(() => {
    checkStatus();
    const statusInterval = setInterval(checkStatus, 10000);
    return () => clearInterval(statusInterval);
  }, [checkStatus]);

  useEffect(() => {
    if (esp32Status === 'connected') {
      fetchData();
      const dataInterval = setInterval(fetchData, 3000);
      return () => clearInterval(dataInterval);
    }
  }, [esp32Status, fetchData]);

  return {
    sensorData,
    esp32Status,
    camStatus,
    thresholds,
    currentThresholds: thresholds,
    lastUpdate,
    alerts,
    fetchData,
    setEsp32Status
  };
}