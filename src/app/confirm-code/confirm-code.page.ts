import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { DataService } from '../services/data.service';
import TelegramService from '../services/telegram.service';

@Component({
  selector: 'app-confirm-code',
  templateUrl: './confirm-code.page.html',
  styleUrls: ['./confirm-code.page.scss'],
})
export class ConfirmCodePage implements OnInit, OnDestroy {

  confirmationCode: string = "";

  constructor(private dataService: DataService, private router: Router, private toastController: ToastController, private telegram: TelegramService) { }

  async validateConfirmationCode() {
    if(this.confirmationCode.length == 5) {
      console.log("confmation code ok");
      await this.telegram.inputTelegramCode(this.confirmationCode);
      if(this.telegram.needsPasswordAuth) {
        return this.router.navigate(["/password-confirm"]);
      }
      return this.router.navigate(["/chats"]);
    }
    return ""
  }

  async validateOnButtonSubmit() {
    if(this.confirmationCode.length == 5) {
      return console.log("confmation code ok");
    }
    return await this.sendToastNotification("Confirmation code invalid.");
  }

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
    if (this.telegram.loggedIn) {
      this.router.navigate(["/chats"]);
    }
  }

  ionViewWillLeave() {
    console.log("Confirm - ViewWillLeave")
  }

  ngOnDestroy() {
    console.log("Confirm - OnDestroy")
  }

}
