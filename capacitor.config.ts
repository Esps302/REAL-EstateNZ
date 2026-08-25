import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'realstate.app',
  appName: 'RealEstate NZ',
  webDir: 'public',
  server: {
    url: 'https://real-estate-nine-beryl.vercel.app',
    cleartext: true
  },
  plugins: {
    GoogleSignIn: {
      // Web Client ID from Firebase Console → Authentication → Google → Web SDK configuration
      // Replace this with your actual Web Client ID:
      serverClientId: '943671421296-6r7jidf10c3ce6jdendu04ponjiafcce.apps.googleusercontent.com',
    }
  }
};

export default config;
