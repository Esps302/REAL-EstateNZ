import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'realstate.app',
  appName: 'Heaven Bricks',
  webDir: 'public',
  server: {
    url: 'https://www.heavenbrick.com',
    cleartext: false
  },
  plugins: {
    GoogleSignIn: {
      // Web Client ID from Firebase Console → Authentication → Google → Web SDK configuration
      serverClientId: '943671421296-6r7jidf10c3ce6jdendu04ponjiafcce.apps.googleusercontent.com',
    }
  }
};

export default config;
