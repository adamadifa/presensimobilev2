import { useEffect, useState } from 'react';
import { NativeModules, Platform } from 'react-native';

const { DeveloperOptionsModule } = NativeModules as {
  DeveloperOptionsModule: {
    isDeveloperOptionsEnabled(): Promise<boolean>;
  };
};

interface UseDeveloperOptionsReturn {
  isDeveloperOptionsEnabled: boolean;
  checkDeveloperOptions: () => Promise<boolean>;
}

export const useDeveloperOptions = (): UseDeveloperOptionsReturn => {
  const [isDeveloperOptionsEnabled, setIsDeveloperOptionsEnabled] = useState(false);

  const checkDeveloperOptions = async (): Promise<boolean> => {
    try {
      if (Platform.OS !== 'android') {
        // iOS tidak memiliki developer options seperti Android
        return false;
      }

      if (!DeveloperOptionsModule) {
        console.warn('DeveloperOptionsModule tidak tersedia');
        return false;
      }

      const isEnabled = await DeveloperOptionsModule.isDeveloperOptionsEnabled();
      setIsDeveloperOptionsEnabled(isEnabled);
      return isEnabled;
    } catch (error) {
      console.error('Error checking developer options:', error);
      return false;
    }
  };

  useEffect(() => {
    // Check saat hook pertama kali digunakan
    checkDeveloperOptions();
  }, []);

  return {
    isDeveloperOptionsEnabled,
    checkDeveloperOptions,
  };
};

