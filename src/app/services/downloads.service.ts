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
  public mediasData: DownloadableFile[] = [];
  private chatInfo: any;
  private BATCH_SIMUL_FILE_LIMIT = 10;
  private BATCH_SIMUL_DOWNLOADABLE: DownloadableFile[][] = [];
  private doneFiles: DownloadableFile[] = [];

  public status: string = "WAITING";

  private bigIntReplacer(key: any, value: any) {
    if (typeof value === 'bigint') {
      return value.toString(); // Convert BigInt to a string representation
    }
    return value;
  }

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
      this.startDownload();
    } else {
      
    }
  }

  removeFromMediaArray(dlItem: DownloadableFile) {
    const index = this.mediasData.findIndex(item => item.id === dlItem.id);
    if (index !== -1) {
      this.mediasData.splice(index, 1);
    }
    this.dataService.set(this.KEYNAME, JSON.stringify({
      medias: this.mediasData,
      chatInfo: this.chatInfo
    }, this.bigIntReplacer));
    this.doneFiles.push(dlItem);
  }

  private async startDownload() {
    this.splitArrayIntoBatches()
    for (let arr of this.BATCH_SIMUL_DOWNLOADABLE) {
      Promise.all(arr.map((item) => {
        item.start(this.removeFromMediaArray);
      }));
    }
    let ok: any[] = [];
    let fail: any[] = [];
    for(let item of this.doneFiles) {
      if (item.type === "completed") {
        ok.push(item);
      } else if (item.type === "error") {
        fail.push(item);
      }
    }
    console.log(`failed: ${fail}`);
    console.log(`ok: ${ok}`);
    await this.done();
    await this.dataService.delete(this.KEYNAME);
  }

  private splitArrayIntoBatches() {
    for (let i = 0; i < this.mediasData.length; i += this.BATCH_SIMUL_FILE_LIMIT) {
      this.BATCH_SIMUL_DOWNLOADABLE.push(this.mediasData.slice(i, i + this.BATCH_SIMUL_FILE_LIMIT));
    }
  }

  private async downloadFinished() {

  }

  private async clearPending() {

  }

  private async done() {
    this.status = "WAITING";
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
      this.chatInfo = chatEntity.id.value;
      this.dataService.set(this.KEYNAME, JSON.stringify({
        medias: this.mediasData,
        chatInfo: this.chatInfo
      }, this.bigIntReplacer));
      this.status = "DOWNLOADING"
      this.startDownload();
    }
  }
}


class DownloadableFile {

  filename: string = "file";
  id: any;
  type: string = "pending";
  progress: number = 0;
  completed: boolean = false;
  color: string = "warning"
  media: any;
  buffer: any;

  constructor(
    private telegram: TelegramService,
    private config: ConfigService,
    media: any
  ) {
    console.log(media);
    this.getData(media);
  }

  toJSON() {
    return {
      filename: this.filename,
      id: this.id,
      type: this.type,
      progress: this.progress,
      color: this.color,
      completed: this.completed,
      media: this.media,
      buffer: this.buffer
    }
  }

  static fromJSON(telegram: TelegramService, config: ConfigService, jsonData: any) {
    return new this(telegram, config, jsonData.media);
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
      this.id = media.document.id.value;
      mimetype = media.document.mimeType;
      if (filename == "") {
        filename = `${media.document.id.value}.${this.extensionSelector(media.document.mimeType)}`;
      }
    } else if (media.className == "MessageMediaPhoto") {
      this.id = media.photo.id.value
      filename = media.photo.id.value + ".jpg";
    }
    let extension: string | undefined = ""
    if (mimetype) {
      extension = extension ? extension : "";
    }
    if (filename == "") {
      console.log(filename);
      console.log(media);
    }
    this.filename = `${filename}`
  }

  private extensionSelector(mimeType: string) {
    const extension = mimeType.split(".").pop()
    switch(extension) {
      case "matroska":
        return "mkv";
      case "quicktime":
        return "mov";
      default:
        return "mp4"
    }
  }

  async start(__callback: any) {
    this.type = "downloading";
    this.color = "";
    this.buffer = await this.telegram.client?.downloadMedia(this.media, {
      progressCallback: ((total, downloaded) => {
        this.progress = Math.round((downloaded as any) / (total as any) * 100) / 100;
      })
    });
    this.callback(__callback);
  }

  async callback(done_callback: any) {
    if (await this.config.saveFile(this.filename, this.buffer)) {
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
    done_callback(this);
  }
}
