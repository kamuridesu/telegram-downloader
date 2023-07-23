import { Injectable } from '@angular/core';

import { ConfigService } from './config.service';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  private limit = 3;
  private activeDownloads = 0;
  private downloadQueue: any[] = [];

  constructor() {

  }

  async downloadFile(downloadable: DownlodableObject, callback: any = undefined) {
    return new Promise((resolve, reject) => {
      this.downloadQueue.push({ downloadable, callback, resolve, reject });
      this.processQueue();
    });
  }

  setLimit(newLimit: number) {
    console.log("New limit: ", newLimit);
    this.limit = newLimit;
    this.processQueue();
  }

  async processQueue() {
    while (this.activeDownloads < this.limit && this.downloadQueue.length > 0) {
      const { downloadable, callback, resolve, reject } = this.downloadQueue.shift();
      this.activeDownloads++;

      try {
        await downloadable.start(callback);
      } catch (error) {
        console.error(`Error downloading ${downloadable.filename}: ${error}`);
        reject(error);
      }

      this.activeDownloads--;
    }
  }
}


interface DownlodableObject {
  filename: string
  start(): any;
}