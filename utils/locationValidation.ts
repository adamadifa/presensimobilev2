export const locationValidationScript = `
(function() {
  'use strict';
  
  const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
  const originalWatchPosition = navigator.geolocation.watchPosition;
  
  // Continuous monitoring interval
  let monitoringInterval = null;
  let lastPosition = null;
  
  function validateLocation(position) {
    const coords = position.coords;
    const issues = [];
    
    // Kriteria yang lebih ketat
    if (coords.accuracy > 50) { issues.push('Low accuracy: ' + coords.accuracy + 'm'); }
    if (coords.speed && coords.speed > 50) { issues.push('Unrealistic speed: ' + (coords.speed * 3.6).toFixed(1) + ' km/h'); }
    if (coords.altitude && (coords.altitude < -500 || coords.altitude > 5000)) { issues.push('Unusual altitude: ' + coords.altitude + 'm'); }
    if (position.provider && position.provider.toLowerCase().includes('network')) { issues.push('Using network provider instead of GPS'); }
    
    // Deteksi perubahan lokasi yang tidak masuk akal
    if (lastPosition) {
      const timeDiff = position.timestamp - lastPosition.timestamp;
      const distance = getDistance(
        lastPosition.coords.latitude, lastPosition.coords.longitude,
        coords.latitude, coords.longitude
      );
      const speed = distance / (timeDiff / 1000); // m/s
      
      if (speed > 50) { // > 180 km/h
        issues.push('Unrealistic movement speed: ' + (speed * 3.6).toFixed(1) + ' km/h');
      }
    }
    
    lastPosition = position;
    return { isValid: issues.length === 0, issues: issues, position: position };
  }
  
  // Calculate distance between two points
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  }
  
  // Start continuous monitoring
  function startContinuousMonitoring() {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
    }
    
    monitoringInterval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(position) {
            const validation = validateLocation(position);
            if (!validation.isValid) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'LOCATION_VALIDATION_FAILED',
                  issues: validation.issues,
                  position: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    speed: position.coords.speed,
                    altitude: position.coords.altitude,
                    timestamp: position.timestamp
                  }
                }));
              }
            }
          },
          function(error) {
            console.log('Location monitoring error:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000
          }
        );
      }
    }, 15000); // Check every 15 seconds
  }
  
  // Override getCurrentPosition
  navigator.geolocation.getCurrentPosition = function(successCallback, errorCallback, options) {
    const wrappedSuccess = function(position) {
      const validation = validateLocation(position);
      if (!validation.isValid) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'LOCATION_VALIDATION_FAILED',
            issues: validation.issues,
            position: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed,
              altitude: position.coords.altitude,
              timestamp: position.timestamp
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
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'LOCATION_VALIDATION_FAILED',
            issues: validation.issues,
            position: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed,
              altitude: position.coords.altitude,
              timestamp: position.timestamp
            }
          }));
        }
      }
      successCallback(position);
    };
    return originalWatchPosition.call(this, wrappedSuccess, errorCallback, options);
  };
  
  // Start monitoring when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(startContinuousMonitoring, 3000);
    });
  } else {
    setTimeout(startContinuousMonitoring, 3000);
  }
  
  // Expose monitoring control to window
  window.locationMonitoring = {
    start: startContinuousMonitoring,
    stop: function() {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
      }
    }
  };
  
  console.log('Enhanced location validation script injected successfully');
})();
`;

