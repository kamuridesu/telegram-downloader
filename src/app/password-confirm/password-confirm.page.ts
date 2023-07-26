import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { DataService } from '../services/data.service';
import TelegramService from '../services/telegram.service';


@Component({
  selector: 'app-password-confirm',
  templateUrl: './password-confirm.page.html',
  styleUrls: ['./password-confirm.page.scss'],
})
export class PasswordConfirmPage implements OnInit, OnDestroy {

  password: string = "";

  constructor(private dataService: DataService,
    private router: Router,
    private toastController: ToastController,
    private telegram: TelegramService
  ) { }

  async validatePassword() {
    let toastMessage = "";
    if (this.password.trim() === "") {
      toastMessage = 'Password cannot be empty.';
    } else {
      try {
        await this.telegram.inputPassword(this.password.trim());
        this.dataService.set("TELEGRAM_SESSION_STRING", this.telegram.client?.session.save());
        return this.router.navigate(['/chats'])
      } catch (err) {
        toastMessage = "Wrong password!";
      }
    }
    const toast = await this.toastController.create({
      message: toastMessage,
      duration: 2000,
      position: 'bottom'
    });
    return await toast.present()
  }

  async ngOnInit() {
  }

  async ionViewWillEnter() {
    await this.telegram.init();
    if (this.telegram.loggedIn) {
      this.router.navigate(["/chats"]);
    }
  }

  ionViewWillLeave() {
    
  }

  ngOnDestroy() {
    
  }

}
