import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { DataService } from '../services/data.service';

@Component({
  selector: 'app-phonelogin',
  templateUrl: './phonelogin.page.html',
  styleUrls: ['./phonelogin.page.scss'],
})
export class PhoneloginPage implements OnInit {

  phoneNumber: string = '';

  constructor(private router: Router, private dataService: DataService, private toastController: ToastController) { }

  async validatePhoneNumber() {
    if (this.phoneNumber.trim() === '') {
      const toast = await this.toastController.create({
        message: 'Phone number is required.',
        duration: 2000,
        position: 'bottom'
      });
      return await toast.present()
    }
    this.router.navigate(["/confirm-code"])
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
