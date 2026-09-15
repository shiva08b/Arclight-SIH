import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.gov.labellens',
  appName: 'LabelLens Inspector',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
