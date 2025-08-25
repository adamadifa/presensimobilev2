import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export class PermissionManager {
  // Request camera permission
  static async requestCameraPermission(): Promise<boolean> {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Aplikasi memerlukan izin kamera untuk mengambil foto presensi',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => this.openSettings() }
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  // Request location permission
  static async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Aplikasi memerlukan izin lokasi untuk mencatat lokasi presensi',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => this.openSettings() }
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  // Check camera permission status
  static async checkCameraPermission(): Promise<boolean> {
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking camera permission:', error);
      return false;
    }
  }

  // Check location permission status
  static async checkLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }

  // Request all permissions at once
  static async requestAllPermissions(): Promise<{
    camera: boolean;
    location: boolean;
  }> {
    const cameraPermission = await this.requestCameraPermission();
    const locationPermission = await this.requestLocationPermission();
    
    return {
      camera: cameraPermission,
      location: locationPermission
    };
  }

  // Open device settings
  private static openSettings() {
    // This would typically open device settings
    // For now, we'll just show an alert
    Alert.alert(
      'Settings',
      'Silakan buka Settings > Apps > PresensiMobile > Permissions untuk mengaktifkan izin yang diperlukan'
    );
  }
}
