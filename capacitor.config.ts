import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smadacademy.attendance',
  appName: 'SMAD ACADEMY',
  webDir: 'dist',

  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      permissions: {
        camera: true
      }
    },
    Filesystem: {
      permissions: {
        storage: true
      }
    }
  }
};

export default config;