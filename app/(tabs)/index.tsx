import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const openWebView = (url: string) => {
    router.push({
      pathname: '/webview',
      params: { url }
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Hello World!
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Selamat datang di aplikasi Presensi Mobile
      </ThemedText>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => openWebView('https://www.google.com')}
      >
        <ThemedText style={styles.buttonText}>
          Buka Google
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => openWebView('https://www.youtube.com')}
      >
        <ThemedText style={styles.buttonText}>
          Buka YouTube
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
