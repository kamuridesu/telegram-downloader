import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { DataService } from '../services/data.service';
import TelegramService from '../services/telegram.service';

@Component({
  selector: 'app-phonelogin',
  templateUrl: './phonelogin.page.html',
  styleUrls: ['./phonelogin.page.scss'],
})
export class PhoneloginPage implements OnInit, OnDestroy {

  phoneNumber: string = '';

  constructor(private router: Router, private dataService: DataService, private toastController: ToastController, private telegram: TelegramService) { }

  async validatePhoneNumber() {
    if (this.phoneNumber.trim() === '') {
      const toast = await this.toastController.create({
        message: 'Phone number is required.',
        duration: 2000,
        position: 'bottom'
      });
      return await toast.present()
    }
    await this.telegram.loginWithPhoneNumber(this.phoneNumber);
    this.router.navigate(["/confirm-code"])
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
