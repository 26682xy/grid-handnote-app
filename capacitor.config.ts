import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "com.grid.handnote",
  appName: "网格手账",
  webDir: "dist",
  server: {
    androidScheme: "https"
  },
  plugins: {
    Filesystem: {
    }
  }
}

export default config;
