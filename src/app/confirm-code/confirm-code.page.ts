import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { DataService } from '../services/data.service';

@Component({
  selector: 'app-confirm-code',
  templateUrl: './confirm-code.page.html',
  styleUrls: ['./confirm-code.page.scss'],
})
export class ConfirmCodePage implements OnInit {

  confirmationCode: string = "";

  constructor(private dataService: DataService, private router: Router, private toastController: ToastController) { }

  async validateConfirmationCode() {
    if(this.confirmationCode.length == 5) {
      console.log("confmation code ok");
      return this.router.navigate(["/password-confirm"])
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
    if (await this.dataService.hasKey("TELEGRAM_SESSION_STRING")) {
      console.log("SESSION STIRNG RXISTS");
      this.router.navigate(["/chats"]);
    } 
  }

  async ionViewWillEnter() {
    if (await this.dataService.hasKey("TELEGRAM_SESSION_STRING")) {
      console.log("SESSION STIRNG RXISTS");
      this.router.navigate(["/chats"]);
    }
  }

}
