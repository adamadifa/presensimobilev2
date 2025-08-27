import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert } from 'react-native';

interface LocationValidationResult {
  isValid: boolean;
  isFakeGPS: boolean;
  accuracy: number;
  provider: string;
  speed: number | null;
  altitude: number | null;
  error?: string;
}

export const useLocationValidation = () => {
  const [validationResult, setValidationResult] = useState<LocationValidationResult>({
    isValid: false,
    isFakeGPS: false,
    accuracy: 0,
    provider: '',
    speed: null,
    altitude: null,
  });

  const checkFakeGPS = async (): Promise<boolean> => {
    try {
      // Deteksi berdasarkan akurasi dan provider
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1,
      });

      const { accuracy, altitude, speed } = location.coords;
      
      // Kriteria deteksi fake GPS yang lebih ketat
      const isLowAccuracy = accuracy > 50; // Akurasi sangat buruk (> 50m)
      const isHighSpeed = speed && speed > 50; // Kecepatan tidak masuk akal (> 180 km/h)
      const isUnusualAltitude = altitude && (altitude < -500 || altitude > 5000); // Altitude tidak masuk akal
      
      // Deteksi provider (GPS vs Network)
      const provider = location.provider || 'unknown';
      const isNetworkProvider = provider.toLowerCase().includes('network');
      
      // Deteksi mock location (jika tersedia)
      const isMockLocation = location.mocked || false;
      
      // Jika menggunakan network provider atau mock location, kemungkinan fake GPS lebih tinggi
      const isFakeGPS = isLowAccuracy || isHighSpeed || isUnusualAltitude || isNetworkProvider || isMockLocation;
      
      // Log untuk debugging
      console.log('Location Validation Debug:', {
        accuracy,
        speed: speed ? (speed * 3.6).toFixed(1) + ' km/h' : 'N/A',
        altitude,
        provider,
        isMockLocation,
        isLowAccuracy,
        isHighSpeed,
        isUnusualAltitude,
        isNetworkProvider,
        isFakeGPS
      });
      
      setValidationResult({
        isValid: !isFakeGPS,
        isFakeGPS,
        accuracy,
        provider,
        speed,
        altitude,
      });

      return isFakeGPS;
    } catch (error) {
      console.error('Error checking fake GPS:', error);
      setValidationResult({
        isValid: false,
        isFakeGPS: true,
        accuracy: 0,
        provider: 'error',
        speed: null,
        altitude: null,
        error: 'Failed to get location',
      });
      return true;
    }
  };

  const validateLocation = async (): Promise<boolean> => {
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required for attendance verification.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Check fake GPS
      const isFake = await checkFakeGPS();
      
      if (isFake) {
        Alert.alert(
          'Fake GPS Detected',
          'Please disable any fake GPS applications and use real location for attendance.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: () => validateLocation() }
          ]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating location:', error);
      return false;
    }
  };

  return {
    validationResult,
    validateLocation,
    checkFakeGPS,
  };
};
