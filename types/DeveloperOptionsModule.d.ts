declare module 'react-native' {
  interface NativeModulesStatic {
    DeveloperOptionsModule: {
      isDeveloperOptionsEnabled(): Promise<boolean>;
    };
  }
}






