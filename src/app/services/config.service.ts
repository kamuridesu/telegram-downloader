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
  private CONFIG_STORAGE: string = 'configs';
  public DOWNLOAD_STORAGE: string = "";

  constructor(
    private platform: Platform,
    private electronService: ElectronService,
  ) {
    this.DOWNLOAD_STORAGE = Directory.External;
  }

  
  public async setTotalConcurrentDownloads(newValue: number): Promise<boolean> {
    if (newValue <= this.MAX_DOWNLOADS_TOTAL) {
      this.totalConcurrentDownload = newValue;
      Preferences.set({
        key: this.CONFIG_STORAGE,
        value: JSON.stringify(newValue)
      })
      return true;
    }
    return false;
  }

  public async getTotalConcurrentDownloads(): Promise<number> {
    const { value } = await Preferences.get({
      key: this.CONFIG_STORAGE
    });
    this.totalConcurrentDownload = (value ? JSON.parse(value) : 3);
    return this.totalConcurrentDownload;
  }

  public getMaxConcurrentDownloads(): number {
    return this.MAX_DOWNLOADS_TOTAL;
  }

  public async getDownloadStorage() {
    let storage: any = "";
    console.log(this.platform.platforms());
    if(this.platform.is('electron')) {
      storage = await this.electronService.selectFolder();
    }
    this.DOWNLOAD_STORAGE = storage;
    return storage;
  }
}
