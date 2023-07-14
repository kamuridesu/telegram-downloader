import { Injectable } from '@angular/core';

import { ConfigService } from './config.service';
import { DataService } from './data.service';
import TelegramService from './telegram.service';

@Injectable({
  providedIn: 'root'
})
export class DownloadsService {

  private KEYNAME = "TELEGRAM_DOWNLOADING";
  private isDownloadingAChat: boolean = false;
  private mediasData: any[] = [];
  private chatInfo: any;

  constructor(
    private telegram: TelegramService,
    private configService: ConfigService,
    private dataService: DataService
  ) { }

  async init() {
    if (await this.dataService.hasKey(this.KEYNAME)) {
      const savedData = await this.dataService.get(this.KEYNAME);
      this.mediasData = savedData.medias;
      this.chatInfo = savedData.chatInfo;
    } else {
      
    }
  }

  private async startDownload() {

  }

  private async downloadFinished() {

  }

  private async clearPending() {

  }

  private async done() {

  }

  public async start(chatEntity: any) {

  }
}
