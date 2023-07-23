import { Injectable } from '@angular/core';

import { ConfigService } from './config.service';
import { DataService } from './data.service';
import TelegramService from './telegram.service';
import { Buffer } from 'buffer';
import { QueueService } from './queue.service';

@Injectable({
  providedIn: 'root'
})
export class DownloadsService {

  private KEYNAME = "TELEGRAM_DOWNLOADING";
  private isDownloadingAChat: boolean = false;
  public mediasData: DownloadableFile[] = [];
  private chatInfo: any;
  private BATCH_SIMUL_FILE_LIMIT = 3;
  private BATCH_SIMUL_DOWNLOADABLE: DownloadableFile[][] = [];
  private doneFiles: DownloadableFile[] = [];

  public status: string = "WAITING";

  private bigIntReplacer(key: any, value: any) {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }

  constructor(
    private telegram: TelegramService,
    private configService: ConfigService,
    private dataService: DataService
  ) { }

  async init() {
    await this.telegram.init();
    this.configService.init();
    setInterval(async () => {
      this.BATCH_SIMUL_FILE_LIMIT = await this.configService.getTotalConcurrentDownloads();
    }, 500);
    if (!this.isDownloadingAChat){
      console.log("download storage: " + this.configService.DOWNLOAD_STORAGE);
      if (await this.dataService.hasKey(this.KEYNAME)) {
        this.status = "PROCESSING";
        const savedDataRaw = await this.dataService.get(this.KEYNAME);
        const savedData = JSON.parse(savedDataRaw) ? JSON.parse(savedDataRaw) : {}
        this.chatInfo = savedData.chatInfo;
        this.mediasData = savedData.mediasData.map((value: any) => {
          return DownloadableFile.fromJSON(this.telegram, this.configService, value, this.chatInfo);
        });
        this.mediasData.forEach(async (value) => await value.getData());
        this.isDownloadingAChat = true;
        this.status = "DOWNLOADING";
        this.startDownload();
      }
    }
  }

  private updateCompleted(item: DownloadableFile) {
    this.dataService.set(this.KEYNAME, JSON.stringify({
      mediasData: this.mediasData,
      chatInfo: this.chatInfo
    }, this.bigIntReplacer));
  }

  private async startDownload() {
    this.splitArrayIntoBatches();
    const promises: void[][] = [];
    for (const arr of this.BATCH_SIMUL_DOWNLOADABLE) {
      const batchPromises: Promise<void>[] = [];
      for (let i = 0; i < Math.min(arr.length, this.BATCH_SIMUL_FILE_LIMIT); i++) {
        batchPromises.push(arr[i].start(this.updateCompleted.bind(this)));
      }
      promises.push(await Promise.all(batchPromises));
    }
    await Promise.all(promises);
  
    const ok: DownloadableFile[] = [];
    const fail: DownloadableFile[] = [];
    for (const item of this.doneFiles) {
      if (item.type === "completed") {
        ok.push(item);
      } else if (item.type === "error") {
        fail.push(item);
      }
    }
  
    console.log(`failed: ${fail.length}`);
    console.log(`ok: ${ok.length}`);
    await this.done();
    await this.dataService.delete(this.KEYNAME);
  }

  private splitArrayIntoBatches() {
    this.BATCH_SIMUL_DOWNLOADABLE = [];
  
    const itemsToDownload = this.mediasData.filter(item => !item.completed && item.type !== "error");
  
    for (let i = 0; i < itemsToDownload.length; i += this.BATCH_SIMUL_FILE_LIMIT) {
      this.BATCH_SIMUL_DOWNLOADABLE.push(itemsToDownload.slice(i, i + this.BATCH_SIMUL_FILE_LIMIT));
    }
  }

  private async downloadFinished() {

  }

  private async clearPending() {

  }

  private async done() {
    this.status = "WAITING";
  }


  public async start(chatEntity: any) {
    await this.telegram.init();
    if (!this.isDownloadingAChat) {
      this.isDownloadingAChat = true;
      this.status = "PROCESSING";
      const messages = await this.telegram.loadMedias(chatEntity);
      this.chatInfo = chatEntity.id.value;
      for (let message of messages) {
        const downloadable = new DownloadableFile(this.telegram, this.configService, message, this.chatInfo);
        await downloadable.getData(message);
        this.mediasData.push(downloadable);
      }
      this.dataService.set(this.KEYNAME, JSON.stringify({
        mediasData: this.mediasData,
        chatInfo: this.chatInfo
      }, this.bigIntReplacer));
      this.status = "DOWNLOADING"
      this.startDownload();
    }
  }
}


class DownloadableFile {

  filename: string = "file";
  public id: any;
  type: string = "pending";
  progress: number = 0;
  completed: boolean = false;
  color: string = "warning"
  mediaData: any;
  buffer: Buffer | undefined = undefined;
  chatId: any;

  constructor(
    private telegram: TelegramService,
    private config: ConfigService,
    message: any,
    chatId: any
  ) {
    if (message.isAlreadySaved) {
      this.type = message.type == "completed" ? "completed" : "pending";
      this.progress = message.progress >= 1 ? 1 : 0;
      this.color = message.color;
      this.completed = message.completed ? true : false;
    }
    this.id = message.id;
    this.chatId = chatId;
  }

  toJSON() {
    return {
      type: this.type,
      progress: this.progress,
      color: this.color,
      completed: this.completed,
      isAlreadySaved: true,
      id: this.id
    }
  }

  static fromJSON(telegram: TelegramService, config: ConfigService, jsonData: any, chatId: any) {
    return new this(telegram, config, jsonData, chatId);
  }

  public async getData(message: any = undefined) {
    if (message == undefined) message = (await this.telegram.getMessage(this.id, this.chatId))[0];
    const media: any = message.media;
    let filename = "";
    let mimetype = "";

    if (media.document) {
      for (let attr of media.document.attributes) {
        if (attr.className == "DocumentAttributeFilename") {
          filename = attr.fileName;
        }
      }
      mimetype = media.document.mimeType;
      if (filename == "") {
        filename = `${media.document.id.value ? media.document.id.value : media.document.id}.${this.extensionSelector(media.document.mimeType)}`;
      }
    } else if (media.className == "MessageMediaPhoto") {
      filename = (media.photo.id.value ? media.photo.id.value : media.photo.id) + ".jpg";
    }
    let extension: string | undefined = "";
    if (mimetype) {
      extension = extension ? extension : "";
    }
    if (filename == "") {
      console.log(filename);
      console.log(media);
    }
    this.mediaData = media;
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

  async start(__callback: any = undefined) {
    await this.getData();
    this.type = "downloading";
    this.color = "";
    const buffer = await this.telegram.client!.downloadMedia(this.mediaData, {
      progressCallback: ((downloaded, total) => {
        this.progress = Math.round((downloaded as any) / (total as any) * 100) / 100;
      })
    });
    if (buffer)
    this.buffer = Buffer.from(buffer);
    this.callback(__callback);
  }

  private async callback(done_callback: any) {
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
    if (done_callback) {
      done_callback(this);
    }
  }
}
