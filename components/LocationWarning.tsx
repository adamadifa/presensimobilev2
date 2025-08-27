import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LocationWarningProps {
  onRetry: () => void;
  onContinue: () => void;
  validationResult: {
    accuracy: number;
    provider: string;
    speed: number | null;
    altitude: number | null;
  };
}

export default function LocationWarning({ onRetry, onContinue, validationResult }: LocationWarningProps) {
  const handleContinue = () => {
    Alert.alert(
      'Warning',
      'Continuing with potentially fake GPS may result in attendance rejection. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: onContinue, style: 'destructive' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.warningCard}>
        <View style={styles.iconContainer}>
          <Ionicons name="warning" size={60} color="#ff6b35" />
        </View>
        
        <Text style={styles.title}>Fake GPS Detected</Text>
        
        <Text style={styles.description}>
          We detected potential fake GPS usage. Please ensure you're using real location for attendance verification.
        </Text>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Location Details:</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Accuracy:</Text>
            <Text style={[styles.detailValue, validationResult.accuracy > 20 && styles.warningText]}>
              {validationResult.accuracy.toFixed(1)}m
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Provider:</Text>
            <Text style={[styles.detailValue, validationResult.provider.includes('network') && styles.warningText]}>
              {validationResult.provider}
            </Text>
          </View>
          
          {validationResult.speed && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Speed:</Text>
              <Text style={[styles.detailValue, validationResult.speed > 100 && styles.warningText]}>
                {(validationResult.speed * 3.6).toFixed(1)} km/h
              </Text>
            </View>
          )}
          
          {validationResult.altitude && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Altitude:</Text>
              <Text style={[styles.detailValue, (validationResult.altitude < -1000 || validationResult.altitude > 10000) && styles.warningText]}>
                {validationResult.altitude.toFixed(0)}m
              </Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Ionicons name="refresh" size={20} color="#ffffff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Ionicons name="arrow-forward" size={20} color="#ff6b35" />
            <Text style={styles.continueButtonText}>Continue Anyway</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  warningCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b35',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
  },
  warningText: {
    color: '#ff6b35',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ff6b35',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    color: '#ff6b35',
    fontSize: 16,
    fontWeight: '600',
  },
});

