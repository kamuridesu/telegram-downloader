import { Buffer } from 'buffer';
import { cloneDeep } from "lodash";

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { DataService } from '../services/data.service';
import TelegramService from '../services/telegram.service';
import { CacheService } from '../services/cache.service';
import { ToastController } from '@ionic/angular';

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
    private router: Router,
    private telegram: TelegramService,
    private cacheService: CacheService,
  ) { }

  private async sendToastNotification(errorMessage: string) {
    const toast = await this.toastController.create({
      message: errorMessage,
      duration: 2000,
      position: 'bottom'
    });
    return await toast.present()
  }

  async ngOnInit() {
    if (!this.initializing) await this.ionViewWillEnter();
  }

  async ionViewWillEnter() {
    console.log("CHATS - ViewWillEnter");
    if (this.initializing) return;
    this.initializing = true;
    if (!(await this.dataService.hasKey("TELEGRAM_SESSION_STRING"))) {
      this.initializing = false;
      this.router.navigate(["/login"]);
    } else {
      await this.telegram.init();
      this.chats = await this.telegram.loadChats();
      console.log(this.chats);
      this.results = [...this.chats];
      console.log(this.results);
      const cachedImages = await this.cacheService.getCache();
      if (cachedImages && cachedImages.length > 0) {
        this.progress = 1;
        for (let chat of this.chats) {
          for (let image of cachedImages){
            if (JSON.stringify(chat.id) === JSON.stringify(image.channelId)) {
              chat.profilePhoto = image.image;
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
      if (!image.includes("picsum")) {
        image = `data:image/jpeg;base64,${image}`;
      }
      images.push({
        image: image,
        channelId: chat.id
      });
      chat.profilePhoto = image;
      this.progress = Math.round(count / this.chats.length * 100) / 100;
    }
    this.cacheService.cacheChats(images);
    this.chatsLoaded = true;
  }

  private async getProfilePhoto(chat: any) {
    const buffer = await this.telegram.client?.downloadProfilePhoto(chat.entity);
    if (buffer) {
      const encoded = Buffer.from(buffer).toString("base64");
      return encoded;
    }
    return "https://picsum.photos/80/80?random="
  }

  handleInput(event: any) {
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
