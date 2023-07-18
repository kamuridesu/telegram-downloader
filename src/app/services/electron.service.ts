import { Injectable } from '@angular/core';

import { Platform } from '@ionic/angular';

import { Filesystem, Directory } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  constructor(
    private platform: Platform
  ) { 
    // if (this.platform.is('electron')) this.waitSelectFolderFromIpc();
  }

  private waitSelectFolderFromIpc(): Promise<string> {
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
      return this.waitSelectFolderFromIpc();
    }
    return Promise.reject('selectFolder is only available in Electron platform.');
  }

  public async sendFile(fileData: any): Promise<any> {
    if (this.platform.is('electron')) {
      (window as any).ipcRenderer.send('newFile', fileData);
      return new Promise<any>((resolve) => {
        (window as any).ipcRenderer.on('fileSaved', (event: any, success: string) => {
          console.log("File saved!");
          resolve(success);
        })
      })
    }
    return Promise.reject('Method is only available in Electron platform.');
  }
}
