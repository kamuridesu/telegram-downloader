import { Buffer } from 'buffer';

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

  items: any[] = [];
  chatsLoaded = false;
  progress = 0;

  constructor(
    // private telegramService: TelegramService,
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

  }

  async ionViewWillEnter() {
    await this.telegram.init();
    console.log("enter chats");
    if (!(await this.dataService.hasKey("TELEGRAM_SESSION_STRING"))) {
      console.log("NOT SESSION STIRNG RXISTS");
      this.router.navigate(["/login"]);
    } else {
      const cached = await this.cacheService.getCache();
      if (cached) {
        this.items = cached;
        this.progress = 1;
      } else {
        this.generateItems();
      }
    }
  }


  private async generateItems() {
    const chats = await this.telegram.loadChats();
    let x = 0;
    for (let chat of chats) {
      let image = await this.getProfilePhoto(chat);
      if (!image.includes("picsum")) {
        image = `data:image/jpeg;base64,${image}`;
      }
      this.items.push({
        title: chat.title ? chat.title : (chat.name ? chat.name : "Undefined"),
        profilePhoto: image
      });
      this.progress = Math.round(this.items.length / chats.length * 100) / 100;
    }
    this.cacheService.cacheChats(this.items);
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

  ionViewWillLeave() {
    console.log("Chats - ViewWillLeave")
  }

  ngOnDestroy() {
    console.log("Chats - OnDestroy")
  }

}
