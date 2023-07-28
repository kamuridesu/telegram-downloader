import { Injectable } from '@angular/core';

import bigInt from 'big-integer';

import { ConfigService } from './config.service';
import { DataService } from './data.service';
import TelegramService from './telegram.service';
import { Buffer } from 'buffer';

@Injectable({
  providedIn: 'root'
})
export class DownloadsService {

  private readonly KEYNAME = "TELEGRAM_DOWNLOADING";
  private BATCH_SIMUL_DOWNLOADABLE: DownloadableFile[][] = [];
  private isDownloadingAChat: boolean = false;
  private BATCH_SIMUL_FILE_LIMIT = 3;
  private chatInfo: any;

  public mediasData: DownloadableFile[] = [];
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
    this.BATCH_SIMUL_FILE_LIMIT = await this.configService.getTotalConcurrentDownloads();
    setInterval(async () => {
      const newLimit = await this.configService.getTotalConcurrentDownloads();
      if (newLimit != this.BATCH_SIMUL_FILE_LIMIT) {
        this.BATCH_SIMUL_FILE_LIMIT = newLimit;
        window.location.reload();
      }
    }, 5000);
    if (!this.isDownloadingAChat && await this.dataService.hasKey(this.KEYNAME)){
      this.status = "PROCESSING";
      const savedDataRaw = await this.dataService.get(this.KEYNAME);
      const savedData = JSON.parse(savedDataRaw) ? JSON.parse(savedDataRaw) : {}
      this.chatInfo = bigInt(savedData.chatInfo);
      this.mediasData = savedData.mediasData.map((value: any) => {
        return DownloadableFile.fromJSON(this.telegram, this.configService, value, this.chatInfo);
      });
      if (! await this.telegram.checkConnection()) {
        await this.telegram.connect();
      }
      this.isDownloadingAChat = true;
      this.status = "DOWNLOADING";
      this.startDownload();
    }
  }

  private updateCompleted(_: any = undefined) {
    this.dataService.set(this.KEYNAME, JSON.stringify({
      mediasData: this.mediasData,
      chatInfo: this.chatInfo
    }, this.bigIntReplacer));
  }

  private async startDownload() {
    this.splitArrayIntoBatches();
    const promises: void[][] = [];
    this.status = "DOWNLOADING"
    for (const arr of this.BATCH_SIMUL_DOWNLOADABLE) {
      const batchPromises: Promise<void>[] = [];
      for (let i = 0; i < Math.min(arr.length, this.BATCH_SIMUL_FILE_LIMIT); i++) {
        batchPromises.push(arr[i].start(this.updateCompleted.bind(this)));
      }
      promises.push(await Promise.all(batchPromises));
    }
    await Promise.all(promises);
  
    await this.done();
  }

  private splitArrayIntoBatches() {
    this.BATCH_SIMUL_DOWNLOADABLE = [];
  
    const itemsToDownload = this.mediasData.filter(item => !item.completed && item.type !== "error");
  
    for (let i = 0; i < itemsToDownload.length; i += this.BATCH_SIMUL_FILE_LIMIT) {
      this.BATCH_SIMUL_DOWNLOADABLE.push(itemsToDownload.slice(i, i + this.BATCH_SIMUL_FILE_LIMIT));
    }
  }

  private async done() {
    this.status = "WAITING";
    await this.dataService.delete(this.KEYNAME);
    this.mediasData = [];
    this.isDownloadingAChat = false;
  }

  public async start(chatEntity: any) {
    await this.telegram.connect();
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
      this.startDownload();
    }
  }

  public async deleteItem(item: DownloadableFile) {
    const index = this.mediasData.indexOf(item);
    if (index > -1) {
      this.mediasData.splice(index, 1);
      item.cancel();
      this.updateCompleted(item);
    }
  }

  public async cancelAll() {
    for (let item of this.mediasData) {
      item.cancel();
    }
    this.mediasData = [];
    this.status = "WAITING";
    this.isDownloadingAChat = false;
    await this.dataService.delete(this.KEYNAME);
  }
}

class DownloadableFile {

  public id: any;
  public progress: number = 0;
  public filesize: number = 0;
  public completed: boolean = false;
  public downloading: boolean = false;
  public type: string = "pending";
  public color: string = "warning";
  public filename: string = "file";

  private chatId: any;
  private mediaData: any;
  private isCancelled: boolean = false;
  private buffer: Buffer | undefined = undefined;

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
      this.filename = message.filename ? message.filename : "file";
      this.filesize = message.filesize ? message.filesize : 0;
    }
    this.id = message.id;
    this.chatId = chatId;
  }

  toJSON() {
    return {
      filename: this.filename,
      type: this.type,
      progress: this.progress,
      color: this.color,
      completed: this.completed,
      isAlreadySaved: true,
      id: this.id,
      filesize: this.filesize
    }
  }

  static fromJSON(telegram: TelegramService, config: ConfigService, jsonData: any, chatId: any) {
    return new this(telegram, config, jsonData, chatId);
  }

  public async getData(message: any = undefined) {
    if (message == undefined){
      if (!await this.telegram.checkConnection()) {
        await this.telegram.connect();
      }
      message = (await this.telegram.getMessage(this.id, bigInt(this.chatId)))[0];
    }
    const media: any = message.media;
    let filename = "";

    if (media.document) {
      for (let attr of media.document.attributes) {
        if (attr.className == "DocumentAttributeFilename") {
          filename = attr.fileName;
        }
      }
      if (filename == "") {
        filename = `${media.document.id.value ? media.document.id.value : media.document.id}.${this.extensionSelector(media.document.mimeType)}`;
      }
    } else if (media.className == "MessageMediaPhoto") {
      filename = (media.photo.id.value ? media.photo.id.value : media.photo.id) + ".jpg";
    }
    if (filename == "") {
      console.log(filename);
      console.log(media);
    }
    this.mediaData = media;
    this.filename = `${filename}`;
  }

  private extensionSelector(mimeType: string) {
    const extension = mimeType.split(".").pop()
    switch(extension) {
      case "matroska":
        return "mkv";
      case "quicktime":
        return "mov";
      default:
        return "mp4";
    }
  }

  public cancel() {
    this.type = "pending";
    this.isCancelled = true;
  }

  private sizeOfBytes(bytes: number, suffix: string = "B") {
    for (let unit of ["", "Ki", "Mi", "Gi", "Ti", "Pi", "Ei", "Zi"]) {
      if (Math.abs(bytes) < 1024.0) {
        return {
          value: bytes.toFixed(1),
          unit: `${unit}${suffix}`
        }
      }
      bytes = bytes / 1024.0
    }
    return {
      value: bytes.toFixed(1),
      unit: `Yi${suffix}`
    }
  }

  async start(__callback: any = undefined) {
    if (this.isCancelled) {
      return;
    }
    if (! await this.telegram.checkConnection()) {
      await this.telegram.connect();
    }
    await this.getData();
    this.type = "downloading";
    this.color = "";
    let buffer: string | any | undefined;
    let retries = 0;
    while (retries < 5) {
      try {
        buffer = await this.telegram.client!.downloadMedia(this.mediaData, {
          progressCallback: ((downloaded, total) => {
            this.progress = Math.round((downloaded as any) / (total as any) * 100) / 100;
          })
        });
        break;
      } catch (e: any) {
        retries++;
        if (! await this.telegram.checkConnection()) {
          await this.telegram.connect();
        }
        await this.telegram.client?.getSender(e.newDc);
      }
    }
    if (this.isCancelled) {
      return;
    }
    if (buffer) {
      this.buffer = Buffer.from(buffer);
    }
    this.callback(__callback);
  }

  private async callback(done_callback: any) {
    if (this.isCancelled) {
      return;
    }
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
