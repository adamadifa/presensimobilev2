import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PermissionManager } from '../utils/permissions';

interface PresensiCameraProps {
  onPhotoTaken: (photoUri: string, location: Location.LocationObject | null) => void;
}

export default function PresensiCamera({ onPhotoTaken }: PresensiCameraProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<Camera>(null);

  React.useEffect(() => {
    (async () => {
      const permissions = await PermissionManager.requestAllPermissions();
      
      if (permissions.camera && permissions.location) {
        setHasPermission(true);
      } else {
        setHasPermission(false);
        Alert.alert(
          'Permissions Required',
          'Aplikasi memerlukan izin kamera dan lokasi untuk presensi'
        );
      }
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current || !isCameraReady) {
      Alert.alert('Error', 'Kamera belum siap');
      return;
    }

    try {
      // Get current location
      let location = null;
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
      } catch (locationError) {
        console.log('Error getting location:', locationError);
        // Continue without location
      }

      // Take photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      onPhotoTaken(photo.uri, location);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Gagal mengambil foto');
    }
  };

  const flipCamera = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Meminta izin kamera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Tidak ada akses ke kamera</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => PermissionManager.requestAllPermissions()}
        >
          <Text style={styles.buttonText}>Minta Izin Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        ref={cameraRef}
        onCameraReady={() => setIsCameraReady(true)}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.captureButton, !isCameraReady && styles.disabledButton]}
            onPress={takePicture}
            disabled={!isCameraReady}
          >
            <Text style={styles.captureButtonText}>📸</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 10,
  },
  captureButton: {
    backgroundColor: '#1e3a8a',
    padding: 20,
    borderRadius: 50,
    borderWidth: 5,
    borderColor: '#ffffff',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  captureButtonText: {
    fontSize: 30,
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
  button: {
    backgroundColor: '#1e3a8a',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});
