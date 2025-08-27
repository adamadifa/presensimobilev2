// JavaScript injection untuk validasi lokasi di WebView
export const locationValidationScript = `
(function() {
  'use strict';
  
  // Override geolocation untuk validasi
  const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
  const originalWatchPosition = navigator.geolocation.watchPosition;
  
  // Fungsi untuk validasi lokasi
  function validateLocation(position) {
    const coords = position.coords;
    const issues = [];
    
    // Validasi akurasi
    if (coords.accuracy > 20) {
      issues.push('Low accuracy: ' + coords.accuracy + 'm');
    }
    
    // Validasi kecepatan
    if (coords.speed && coords.speed > 100) {
      issues.push('Unrealistic speed: ' + (coords.speed * 3.6).toFixed(1) + ' km/h');
    }
    
    // Validasi altitude
    if (coords.altitude && (coords.altitude < -1000 || coords.altitude > 10000)) {
      issues.push('Unusual altitude: ' + coords.altitude + 'm');
    }
    
    // Validasi provider (jika tersedia)
    if (position.provider && position.provider.toLowerCase().includes('network')) {
      issues.push('Using network provider instead of GPS');
    }
    
    return {
      isValid: issues.length === 0,
      issues: issues,
      position: position
    };
  }
  
  // Override getCurrentPosition
  navigator.geolocation.getCurrentPosition = function(successCallback, errorCallback, options) {
    const wrappedSuccess = function(position) {
      const validation = validateLocation(position);
      
      if (!validation.isValid) {
        console.warn('Location validation failed:', validation.issues);
        
        // Kirim data ke React Native
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'LOCATION_VALIDATION_FAILED',
            issues: validation.issues,
            position: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed,
              altitude: position.coords.altitude
            }
          }));
        }
      }
      
      successCallback(position);
    };
    
    return originalGetCurrentPosition.call(this, wrappedSuccess, errorCallback, options);
  };
  
  // Override watchPosition
  navigator.geolocation.watchPosition = function(successCallback, errorCallback, options) {
    const wrappedSuccess = function(position) {
      const validation = validateLocation(position);
      
      if (!validation.isValid) {
        console.warn('Location validation failed (watch):', validation.issues);
        
        // Kirim data ke React Native
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'LOCATION_VALIDATION_FAILED',
            issues: validation.issues,
            position: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed,
              altitude: position.coords.altitude
            }
          }));
        }
      }
      
      successCallback(position);
    };
    
    return originalWatchPosition.call(this, wrappedSuccess, errorCallback, options);
  };
  
  // Deteksi aplikasi fake GPS (jika tersedia)
  function detectFakeGPSApps() {
    const fakeGPSApps = [
      'com.lexa.fakegps',
      'com.evezzon.fakegps',
      'com.incorporateapps.fakegps',
      'com.dummy.fakegps',
      'com.fakegps.fakegps',
      'com.fakegps.free',
      'com.fakegps.pro',
      'com.fakegps.lite',
      'com.fakegps.mock',
      'com.fakegps.spoofer'
    ];
    
    // Cek apakah ada aplikasi fake GPS yang terinstall
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'CHECK_FAKE_GPS_APPS',
        apps: fakeGPSApps
      }));
    }
  }
  
  // Jalankan deteksi saat halaman dimuat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', detectFakeGPSApps);
  } else {
    detectFakeGPSApps();
  }
  
  console.log('Location validation script injected successfully');
})();
`;

