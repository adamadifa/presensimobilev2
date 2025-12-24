
import { useDeveloperOptions } from '@/hooks/useDeveloperOptions';
import { locationValidationScript } from '@/utils/locationValidation';
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';

export default function WebViewScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const { checkDeveloperOptions } = useDeveloperOptions();

  // Interval untuk monitoring berkelanjutan
  const monitoringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Default URL jika tidak ada parameter
  const webUrl = 'https://presensi.adamadifa.site';

  // JavaScript to enable camera and location permissions + validation
  const injectedJavaScript = `
    // Enable camera access
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(function(stream) {
          console.log('Camera and microphone access granted');
        })
        .catch(function(err) {
          console.log('Camera access error:', err);
        });
    }
    
    // Enable geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(position) {
          console.log('Location access granted');
        },
        function(error) {
          console.log('Location access error:', error);
        }
      );
    }
    
    // Override permission queries to always return granted
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'camera' }).then(function(result) {
        if (result.state === 'denied') {
          result.state = 'granted';
        }
      });
      
      navigator.permissions.query({ name: 'microphone' }).then(function(result) {
        if (result.state === 'denied') {
          result.state = 'granted';
        }
      });
      
      navigator.permissions.query({ name: 'geolocation' }).then(function(result) {
        if (result.state === 'denied') {
          result.state = 'granted';
        }
      });
    }
    
    ${locationValidationScript}
    
    true;
  `;

  // Request permissions for camera and location
  const requestPermissions = async () => {
    try {
      // Request camera permission
      const cameraPermission = await Camera.requestCameraPermissionsAsync();

      // Request location permission
      const locationPermission = await Location.requestForegroundPermissionsAsync();

      if (cameraPermission.status === 'granted' && locationPermission.status === 'granted') {
        console.log('All permissions granted');
      } else {
        console.log('Camera permission:', cameraPermission.status);
        console.log('Location permission:', locationPermission.status);
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  // Fungsi untuk monitoring developer options secara berkelanjutan
  const startContinuousMonitoring = useCallback(() => {
    // Hentikan interval sebelumnya jika ada
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }

    // Mulai monitoring setiap 10 detik
    monitoringIntervalRef.current = setInterval(async () => {
      try {
        // Check developer options
        const isDevOptionsEnabled = await checkDeveloperOptions();
        if (isDevOptionsEnabled) {
          console.log('⚠️ Developer options detected during continuous monitoring!');
          Alert.alert(
            '⚠️ Opsi Pengembang Terdeteksi!',
            'Aplikasi tidak dapat berjalan saat opsi pengembang aktif. Silakan nonaktifkan opsi pengembang di pengaturan perangkat Anda.',
            [
              {
                text: 'Tutup Aplikasi',
                style: 'destructive',
                onPress: () => {
                  BackHandler.exitApp();
                }
              }
            ],
            { cancelable: false }
          );
          return; // Stop monitoring jika developer options terdeteksi
        }
      } catch (error) {
        console.error('Error in continuous monitoring:', error);
      }
    }, 10000); // Check setiap 10 detik
  }, [checkDeveloperOptions]);

  const stopContinuousMonitoring = () => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
  };




  // Mulai monitoring saat komponen mount
  useEffect(() => {
    // Mulai monitoring setelah 5 detik (memberikan waktu untuk WebView load)
    const startTimer = setTimeout(() => {
      startContinuousMonitoring();
    }, 5000);

    // Cleanup saat komponen unmount
    return () => {
      clearTimeout(startTimer);
      stopContinuousMonitoring();
    };
  }, [startContinuousMonitoring]);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    console.error('Error details:', {
      code: nativeEvent.code,
      description: nativeEvent.description,
      domain: nativeEvent.domain,
      url: nativeEvent.url,
    });
    setIsLoading(false);
    // Set error hanya jika benar-benar gagal
    if (nativeEvent.description && !nativeEvent.description.includes('net::ERR_ABORTED')) {
      setHasError(true);
    }
  };

  const handleHttpError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView HTTP error:', nativeEvent.statusCode, nativeEvent.url);
    // Hanya set error untuk status code 4xx dan 5xx
    if (nativeEvent.statusCode >= 400) {
      setIsLoading(false);
      setHasError(true);
    }
  };

  const handleRenderProcessGone = () => {
    console.error('WebView render process crashed');
    setIsLoading(false);
    setHasError(true);
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      // Handler untuk message dari WebView jika diperlukan di masa depan
      console.log('WebView message:', data);
    } catch (error) {
      console.log('Error parsing WebView message:', error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setHasError(false);

    // Reload webview
    if (webViewRef.current) {
      webViewRef.current.reload();
    }

    // Reset refreshing state after a short delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Request permissions when component mounts
  React.useEffect(() => {
    requestPermissions();
  }, []);

  // Check developer options saat aplikasi dimulai
  useEffect(() => {
    const checkDevOptions = async () => {
      const isEnabled = await checkDeveloperOptions();
      if (isEnabled) {
        Alert.alert(
          '⚠️ Opsi Pengembang Terdeteksi!',
          'Aplikasi tidak dapat berjalan saat opsi pengembang aktif. Silakan nonaktifkan opsi pengembang di pengaturan perangkat Anda.',
          [
            {
              text: 'Tutup Aplikasi',
              style: 'destructive',
              onPress: () => {
                BackHandler.exitApp();
              }
            }
          ],
          { cancelable: false }
        );
      }
    };

    // Check setelah 1 detik untuk memastikan hook sudah siap
    const timer = setTimeout(() => {
      checkDevOptions();
    }, 1000);

    return () => clearTimeout(timer);
  }, [checkDeveloperOptions]);

  if (hasError) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <Text style={styles.errorText}>Gagal memuat halaman web</Text>
        <Text style={styles.errorSubtext}>Periksa koneksi internet Anda</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setHasError(false);
            setIsLoading(true);
            if (webViewRef.current) {
              webViewRef.current.reload();
            }
          }}
        >
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <WebView
        ref={webViewRef}
        source={{ uri: webUrl }}
        style={styles.webview}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsProtectedMedia={true}
        allowsFullscreenVideo={true}
        scalesPageToFit={true}
        bounces={true}
        scrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
        injectedJavaScript={injectedJavaScript}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onHttpError={handleHttpError}
        onRenderProcessGone={handleRenderProcessGone}
        onShouldStartLoadWithRequest={(request: WebViewNavigation) => {
          // Allow all navigation
          return true;
        }}
        onMessage={handleMessage}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        mixedContentMode="always"
        originWhitelist={['*']}
        allowsBackForwardNavigationGestures={true}
      />

      {/* Refresh Button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
        disabled={isRefreshing}
      >
        <Ionicons
          name={isRefreshing ? "refresh" : "refresh-outline"}
          size={24}
          color="#ffffff"
        />
      </TouchableOpacity>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Memuat...</Text>
        </View>
      )}

      {/* Simple Location Warning - menggunakan Alert saja */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1e3a8a',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#1e3a8a',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(30, 58, 138, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
});
