import { Injectable } from '@angular/core';

import { ConfigService } from './config.service';
import { DataService } from './data.service';
import TelegramService from './telegram.service';
import { Buffer } from 'buffer';

@Injectable({
  providedIn: 'root'
})
export class DownloadsService {

  private KEYNAME = "TELEGRAM_DOWNLOADING";
  private isDownloadingAChat: boolean = false;
  public mediasData: any[] = [];
  private chatInfo: any;

  public status: string = "WAITING";

  constructor(
    private telegram: TelegramService,
    private configService: ConfigService,
    private dataService: DataService
  ) { }

  async init() {
    console.log("download storage: " + this.configService.DOWNLOAD_STORAGE);
    if (await this.dataService.hasKey(this.KEYNAME)) {
      const savedData = await this.dataService.get(this.KEYNAME);
      this.mediasData = savedData.medias;
      this.chatInfo = savedData.chatInfo;
      this.isDownloadingAChat = true;
      this.status = "DOWNLOADING";
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

  public async test() {
    await this.configService.saveFile('test.txt', Buffer.from((new TextEncoder()).encode('Hello World')));
  }

  public async start(chatEntity: any) {
    if (!this.isDownloadingAChat) {
      this.isDownloadingAChat = true;
      this.status = "PROCESSING";
      const medias = await this.telegram.loadMedias(chatEntity);
      for (let media of medias) {
        this.mediasData.push(new DownloadableFile(this.telegram, this.configService, media));
      }
      this.status = "DOWNLOADING"
    }
  }
}


class DownloadableFile {

  filename: string = "file";
  type: string = "pending";
  progress: number = 0;
  completed: boolean = false;
  color: string = "warning"
  mimetype: string = "";
  media: any;
  buffer: any;

  constructor(
    private telegram: TelegramService,
    private config: ConfigService,
    media: any
  ) {
    this.getData(media);
  }

  private getData(media: any) {
    let filename = "";
    let mimetype = "";

    if (media.document) {
      for (let attr of media.document.attributes) {
        if (attr.className == "DocumentAttributeFilename") {
          filename = attr.fileName;
        }
      }
      mimetype = media.document.mimeType;
    } else if (media.className == "MessageMediaPhoto") {
      filename = media.photo.id.value + ".jpg";
      mimetype = "image/jpg";
    }
    let extension: string | undefined = ""
    if (mimetype) {
      extension = mimetype.split("/").pop();
      extension = extension ? extension : "";
    } else {
      console.log("++++======= No mime")
      console.log(media);
      console.log("++++======= No mime")
    }

    this.filename = `${filename}`
  }

  async start() {
    this.type = "downloading";
    this.color = "";
    this.buffer = await this.telegram.client?.downloadMedia(this.media, {
      progressCallback: ((total, downloaded) => {
        this.progress = Math.round((downloaded as any) / (total as any) * 100) / 100;
      })
    });
    this.callback();
  }

  async callback() {
    if (await this.config.saveFile(this.filename, this.mimetype, this.buffer)) {
      this.type = "completed";
      this.color = "success";
      this.progress = 1;
      this.completed = true;
    } else {
      this.type = "error";
      this.color = "error";
      this.progress = 0;
      this.completed = false;
    }
  }
}
