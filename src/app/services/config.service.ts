import { Injectable } from '@angular/core';

import { Preferences } from "@capacitor/preferences";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  public totalConcurrentDownload: number = 3;

  private MAX_DOWNLOADS_TOTAL: number = 10;
  private CONFIG_STORAGE: string = 'configs';

  constructor() {}

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
    console.log("get from local");
    const { value } = await Preferences.get({
      key: this.CONFIG_STORAGE
    });
    this.totalConcurrentDownload = (value ? JSON.parse(value) : 3);
    console.log("returning local");
    return this.totalConcurrentDownload;
  }

  public async getMaxConcurrentDownloads(): Promise<number> {
    return this.MAX_DOWNLOADS_TOTAL;
  }

}
