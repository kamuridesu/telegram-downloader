import { Buffer } from 'buffer';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

import { DataService } from '../services/data.service';
import TelegramService from '../services/telegram.service';
import { CacheService } from '../services/cache.service';
import { DownloadsService } from '../services/downloads.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit, OnDestroy {

  chats: any[] = [];
  results: any[] = [...this.chats];
  chatsLoaded = false;
  progress = 0;

  private initializing: boolean = false;

  constructor(
    private dataService: DataService,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private telegram: TelegramService,
    private cacheService: CacheService,
    private downloads: DownloadsService,
  ) { }

  private async sendToastNotification(errorMessage: string) {
    const toast = await this.toastController.create({
      message: errorMessage,
      duration: 2000,
      position: 'bottom'
    });
    return await toast.present()
  }

  async ngOnInit() {}

  async ionViewWillEnter(): Promise<any> {
    await this.downloads.init();
    if (this.downloads.status != "WAITING") return this.router.navigate(["/downloads"]);
    if (this.initializing) return;
    this.initializing = true;
    if (!(await this.dataService.hasKey("TELEGRAM_SESSION_STRING"))) {
      this.initializing = false;
      this.router.navigate(["/login"]);
    } else {
      await this.telegram.init();
      while (this.chats.length < 1) {
        this.chats = await this.telegram.loadChats();
      }
      this.results = [...this.chats];
      const cachedImages = await this.cacheService.getCache();
      if (cachedImages && cachedImages.length > 0) {
        this.progress = 1;
        for (let chat of this.chats) {
          for (let image of cachedImages){
            if (JSON.stringify(chat.id) === JSON.stringify(image.channelId)) {
              if (JSON.stringify(chat?.entity?.photo?.id) === JSON.stringify(image.imageId)) {
                chat.profilePhotoBase64 = image.image;
              } else {
                const loadedImage = await this.getProfilePhoto(chat);
                image.image = loadedImage;
                image.imageId = chat?.entity?.photo?.id;
                this.cacheService.setCache(cachedImages);
                chat.profilePhotoBase64 = loadedImage;
              }
              break;
            }
          }
        }
      } else {
        this.sendToastNotification("Loading chats pictures...");
        this.loadProfilePhotos();
      }
    }
    this.initializing = false;
  }

  private async loadProfilePhotos() {
    let count = 0;
    const images: any[] = [];
    for (let chat of this.chats) {
      count++;
      let image = await this.getProfilePhoto(chat);
      images.push({
        image: image,
        channelId: chat.id,
        imageId: chat?.entity?.photo?.id
      });
      chat.profilePhotoBase64 = image;
      this.progress = Math.round(count / this.chats.length * 100) / 100;
    }
    this.cacheService.setCache(images);
    this.chatsLoaded = true;
  }

  private async getProfilePhoto(chat: any) {
    const buffer = await this.telegram.client?.downloadProfilePhoto(chat.entity);
    if (buffer) {
      const encoded = Buffer.from(buffer).toString("base64");
      return `data:image/jpeg;base64,${encoded}`;
    }
    return undefined;
  }

  async presentInputPopup(chat: any) {
    const alert = await this.alertController.create({
      header: `Start Download of Chat ${chat.title}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Start',
          handler: () => {
            this.downloads.start(chat);
            this.router.navigate(["/downloads"])
          }
        }
      ]
    });
    await alert.present();
  }

  public async handleInput(event: any) {
    const query = event.target.value.toLowerCase();
    if (query == "") {
      this.results = [...this.chats];
    } else {
      this.results = this.results.filter((d) => d.title.toLowerCase().indexOf(query) > -1);
    }
  }

  ionViewWillLeave() {
    console.log("Chats - ViewWillLeave")
  }

  ngOnDestroy() {
    console.log("Chats - OnDestroy")
  }
}
