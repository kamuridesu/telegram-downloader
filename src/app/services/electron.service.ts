import { Injectable } from '@angular/core';

import { Platform } from '@ionic/angular';

import { Filesystem, Directory } from '@capacitor/filesystem';


declare global {
  interface Window {
    require: any;
    electron: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  constructor(
    private platform: Platform
  ) { 
    if (this.platform.is('electron')) this.setupIpcListeners();
  }

  private setupIpcListeners(): Promise<string> {
    return new Promise<string>((resolve) => {
      if (this.platform.is('electron')) {
        (window as any).ipcRenderer.on('folderSelected', (event: any, folderPath: string) => {
          console.log('Selected folder:', folderPath);
          resolve(folderPath);
        });
      }
    });
  }
  
  public selectFolder(): Promise<string> {
    if (this.platform.is('electron')) {
      (window as any).ipcRenderer.send('selectFolder');
      return this.setupIpcListeners();
    }
    return Promise.reject('selectFolder is only available in Electron platform.');
  }
}
