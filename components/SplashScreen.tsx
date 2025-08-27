import { useLocationValidation } from '@/hooks/useLocationValidation';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, BackHandler, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

export default function SplashScreen() {
  const { validateLocation } = useLocationValidation();

  // Animasi untuk logo
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoY = useSharedValue(50);

  // Animasi untuk efek riak air
  const ripple1Scale = useSharedValue(0);
  const ripple1Opacity = useSharedValue(1);
  const ripple2Scale = useSharedValue(0);
  const ripple2Opacity = useSharedValue(1);
  const ripple3Scale = useSharedValue(0);
  const ripple3Opacity = useSharedValue(1);

  // Animasi untuk background gradient
  const backgroundOpacity = useSharedValue(0);

  const navigateToMain = () => {
    console.log('Navigating to webview...');
    router.replace('/webview');
  };

  const handleLocationValidation = async () => {
    const isValid = await validateLocation();
    if (!isValid) {
             // Tampilkan alert sederhana jika fake GPS terdeteksi
       Alert.alert(
         '🚨 Fake GPS Terdeteksi!',
         'Sistem mendeteksi penggunaan fake GPS. Silakan nonaktifkan fake GPS.',
         [
           { 
             text: 'Coba Lagi', 
             onPress: () => {
               handleLocationValidation();
             }
           },
           { 
             text: 'Keluar Aplikasi', 
             style: 'destructive',
             onPress: () => {
               BackHandler.exitApp();
             }
           }
         ]
       );
    } else {
      navigateToMain();
    }
  };

  useEffect(() => {
    // Animasi background muncul
    backgroundOpacity.value = withTiming(1, { duration: 800 });

    // Animasi logo muncul dengan bounce effect
    logoScale.value = withSpring(1, {
      damping: 6,
      stiffness: 120,
      mass: 0.6,
    });
    logoOpacity.value = withTiming(1, { duration: 1200 });
    logoY.value = withSpring(0, {
      damping: 8,
      stiffness: 120,
    });

    // Animasi riak air yang lebih realistis
    const startRippleAnimation = () => {
      // Reset ripple values
      ripple1Scale.value = 0;
      ripple1Opacity.value = 1;
      ripple2Scale.value = 0;
      ripple2Opacity.value = 1;
      ripple3Scale.value = 0;
      ripple3Opacity.value = 1;

      // Ripple 1
      ripple1Scale.value = withTiming(4, {
        duration: 2500,
        easing: Easing.out(Easing.cubic),
      });
      ripple1Opacity.value = withTiming(0, {
        duration: 2500,
        easing: Easing.out(Easing.cubic),
      });

      // Ripple 2 (delay 0.6s)
      setTimeout(() => {
        ripple2Scale.value = withTiming(4, {
          duration: 2500,
          easing: Easing.out(Easing.cubic),
        });
        ripple2Opacity.value = withTiming(0, {
          duration: 2500,
          easing: Easing.out(Easing.cubic),
        });
      }, 600);

      // Ripple 3 (delay 1.2s)
      setTimeout(() => {
        ripple3Scale.value = withTiming(4, {
          duration: 2500,
          easing: Easing.out(Easing.cubic),
        });
        ripple3Opacity.value = withTiming(0, {
          duration: 2500,
          easing: Easing.out(Easing.cubic),
        });
      }, 1200);
    };

    startRippleAnimation();

    // Ulangi animasi riak setiap 3 detik
    const rippleInterval = setInterval(startRippleAnimation, 3000);

    // Validasi lokasi dan navigasi ke halaman utama setelah 4 detik
    const navigationTimer = setTimeout(() => {
      runOnJS(handleLocationValidation)();
    }, 4000);

    return () => {
      clearInterval(rippleInterval);
      clearTimeout(navigationTimer);
    };
  }, [
    backgroundOpacity,
    logoOpacity,
    logoScale,
    logoY,
    ripple1Opacity,
    ripple1Scale,
    ripple2Opacity,
    ripple2Scale,
    ripple3Opacity,
    ripple3Scale,
  ]);

  // Style animasi untuk background
  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value,
    };
  });

  // Style animasi untuk logo
  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: logoScale.value },
        { translateY: logoY.value },
      ],
      opacity: logoOpacity.value,
    };
  });

  // Style animasi untuk riak air
  const ripple1Style = useAnimatedStyle(() => {
    const scale = interpolate(ripple1Scale.value, [0, 4], [0, 4]);
    const opacity = interpolate(ripple1Opacity.value, [0, 1], [0, 0.6]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const ripple2Style = useAnimatedStyle(() => {
    const scale = interpolate(ripple2Scale.value, [0, 4], [0, 4]);
    const opacity = interpolate(ripple2Opacity.value, [0, 1], [0, 0.4]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const ripple3Style = useAnimatedStyle(() => {
    const scale = interpolate(ripple3Scale.value, [0, 4], [0, 4]);
    const opacity = interpolate(ripple3Opacity.value, [0, 1], [0, 0.2]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <Animated.View style={[styles.background, backgroundAnimatedStyle]} />
      
      {/* Efek riak air */}
      <Animated.View style={[styles.ripple, ripple1Style]} />
      <Animated.View style={[styles.ripple, ripple2Style]} />
      <Animated.View style={[styles.ripple, ripple3Style]} />
      
      {/* Logo */}
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Image
          source={require('../assets/images/splash-icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>
      
      {/* Text loading */}
      <Text style={styles.loadingText}>
        Presensi Mobile
      </Text>
      
      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Sistem Presensi Digital
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1b5e20',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1b5e20',
  },
  ripple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 255, 255, 0.8)',
    backgroundColor: 'transparent',
    top: '50%',
    left: '50%',
    marginLeft: -40,
    marginTop: -40,
  },
  logoContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -70,
    marginTop: -70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 140,
  },
  loadingText: {
    position: 'absolute',
    bottom: '35%',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    position: 'absolute',
    bottom: '30%',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '300',
  },
});
