import { Injectable } from '@angular/core';

import { Platform } from '@ionic/angular';

import {
  Filesystem, Directory
} from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Preferences } from "@capacitor/preferences";

import { ElectronService } from './electron.service';


@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  public totalConcurrentDownload: number = 3;

  private MAX_DOWNLOADS_TOTAL: number = 10;
  private CONFIG_STORAGE_KEY: string = 'configs';
  public DOWNLOAD_STORAGE: string = "";
  private DOWNLOAD_STORAGE_KEY: string = "";

  constructor(
    private platform: Platform,
    private electronService: ElectronService,
  ) {}
  
  public async setTotalConcurrentDownloads(newValue: number): Promise<boolean> {
    if (newValue <= this.MAX_DOWNLOADS_TOTAL) {
      this.totalConcurrentDownload = newValue;
      Preferences.set({
        key: this.CONFIG_STORAGE_KEY,
        value: JSON.stringify(newValue)
      })
      return true;
    }
    return false;
  }

  public async getTotalConcurrentDownloads(): Promise<number> {
    const { value } = await Preferences.get({
      key: this.CONFIG_STORAGE_KEY
    });
    this.totalConcurrentDownload = (value ? JSON.parse(value) : 3);
    return this.totalConcurrentDownload;
  }

  public getMaxConcurrentDownloads(): number {
    return this.MAX_DOWNLOADS_TOTAL;
  }

  public async getDownloadStorage() {
    const { value } = await Preferences.get({
      key: this.DOWNLOAD_STORAGE_KEY
    });
    this.DOWNLOAD_STORAGE = (value ? JSON.parse(value) : Directory.External);
    return this.DOWNLOAD_STORAGE;
  }

  public async setDownloadStorage() {
    let storage: any = "";
    console.log(this.platform.platforms());
    if(this.platform.is('electron')) {
      storage = await this.electronService.selectFolder();
    }
    this.DOWNLOAD_STORAGE = storage;
    Preferences.set({
      key: this.DOWNLOAD_STORAGE_KEY,
      value: storage
    });
    return storage;
  }

  public async saveFile(fileName: string, mimeType: string, buffer: any, fileId: any, bufferSize: number = 0, ) {
    const fileExtension = mimeType.split('/')[1];
    const fileData = {
      fileName: `${fileName}.${fileExtension}`,
      directory: this.DOWNLOAD_STORAGE,
      buffer: buffer,
      bufferSize: bufferSize,
      fileId: fileId
    }
    if (this.platform.is('electron')) {
      return await this.electronService.sendFile(fileData);
    }
  }
}
