import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { DataService } from '../services/data.service';
import TelegramService from '../services/telegram.service';
import { InfiniteScrollCustomEvent, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit {

  items: string[] = [];

  constructor(
    // private telegramService: TelegramService,
    private dataService: DataService,
    private toastController: ToastController,
    private router: Router,
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
    if (!await this.dataService.hasKey("TELEGRAM_SESSION_STRING")) {
      console.log("NOT SESSION STIRNG RXISTS");
      this.router.navigate(["/login"]);
    }
  }

  async ionViewWillEnter() {
    if (!await this.dataService.hasKey("TELEGRAM_SESSION_STRING")) {
      console.log("NOT SESSION STIRNG RXISTS");
      this.router.navigate(["/login"]);
    } else {
      this.generateItems();
    }
  }


  private async generateItems() {
    const count = this.items.length + 1;
    for (let i = 0; i < 50; i++) {
      this.items.push(`Item ${count + i}`);
    }
  }

  async onIonInfinite(ev: any) {
    await this.generateItems();
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

}
