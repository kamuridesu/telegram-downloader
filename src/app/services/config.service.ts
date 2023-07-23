import { Injectable } from '@angular/core';

import { Platform } from '@ionic/angular';

import {
  Directory
} from '@capacitor/filesystem';
import { Preferences } from "@capacitor/preferences";

import { ElectronService } from './electron.service';
import { DataService } from './data.service';


@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  public totalConcurrentDownload: number = 3;

  private MAX_DOWNLOADS_TOTAL: number = 10;
  private CONFIG_STORAGE_KEY: string = 'configs';
  public DOWNLOAD_STORAGE: string = "";
  private DOWNLOAD_STORAGE_KEY: string = "DOWNLOADS_STORAGE";

  constructor(
    private platform: Platform,
    private electronService: ElectronService,
    private dataService: DataService,
  ) {
    this.init();
  }

  public async init() {
    await this.getDownloadStorage();
  }
  
  public async setTotalConcurrentDownloads(newValue: number): Promise<boolean> {
    if (newValue <= this.MAX_DOWNLOADS_TOTAL) {
      this.totalConcurrentDownload = newValue;
      this.dataService.set(
        this.CONFIG_STORAGE_KEY,
        JSON.stringify(newValue)
      )
      return true;
    }
    return false;
  }

  public async getTotalConcurrentDownloads(): Promise<number> {
    const value = await this.dataService.get(
      this.CONFIG_STORAGE_KEY
    );
    this.totalConcurrentDownload = (value ? JSON.parse(value) : 3);
    return this.totalConcurrentDownload;
  }

  public getMaxConcurrentDownloads(): number {
    return this.MAX_DOWNLOADS_TOTAL;
  }

  public async getDownloadStorage() {
    const value = await this.dataService.get(
      this.DOWNLOAD_STORAGE_KEY
    );
    this.DOWNLOAD_STORAGE = (value ? JSON.parse(value) : Directory.External);
    return this.DOWNLOAD_STORAGE;
  }

  public async setDownloadStorage() {
    let storage: any = "";
    if(this.platform.is('electron')) {
      storage = await this.electronService.selectFolder();
    }
    this.DOWNLOAD_STORAGE = storage;
    this.dataService.set(
      this.DOWNLOAD_STORAGE_KEY,
      JSON.stringify(storage)
    );
    return storage;
  }

  public async saveFile(fileName: string, buffer: any, bufferSize: number = 0): Promise<boolean> {
    const fileData = {
      fileName: fileName,
      directory: this.DOWNLOAD_STORAGE,
      buffer: buffer,
      bufferSize: bufferSize,
    }
    if (this.platform.is('electron')) {
      return await this.electronService.sendFile(fileData);
    }
    return false;
  }
}
