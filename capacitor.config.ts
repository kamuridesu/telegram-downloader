import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kamuri.tldl',
  appName: 'Telegram Downloader',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
