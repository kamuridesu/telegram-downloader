import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { DataService } from '../services/data.service';


@Component({
  selector: 'app-password-confirm',
  templateUrl: './password-confirm.page.html',
  styleUrls: ['./password-confirm.page.scss'],
})
export class PasswordConfirmPage implements OnInit {

  password: string = "";

  constructor(private dataService: DataService, private router: Router, private toastController: ToastController) { }

  async validatePassword() {
    if (this.password.trim() === "") {
      const toast = await this.toastController.create({
        message: 'Password cannot be empty.',
        duration: 2000,
        position: 'bottom'
      });
      return await toast.present()
    }
    await this.dataService.set("TELEGRAM_SESSION_STRING", "yes");
    return this.router.navigate(['/chats'])
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
