import { CapacitorElectronConfig } from "@capacitor-community/electron";

const config: CapacitorElectronConfig = {
  appId: 'io.ionic.starter',
  appName: 'telegram_downloader',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  electron: {
    customUrlScheme: "capacitor-electron",
    trayIconAndMenuEnabled: false,
    // Switch on/off whether or not a splashscreen will be used.
    splashScreenEnabled: false,
    // Custom image name in the electron/assets folder to use as splash image (.gif included)
    splashScreenImageName: 'splash.png',
    // Switch on/off if the main window should be hidden until brought to the front by the tray menu, etc.
    hideMainWindowOnLaunch: false,
    // Switch on/off whether or not to use deeplinking in your app.
    deepLinkingEnabled: false,
    // Custom protocol to be used with deeplinking for your app.
    deepLinkingCustomProtocol: 'mycapacitorapp',
  }
};

export default config;
