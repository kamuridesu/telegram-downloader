import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

import { DataService } from '../services/data.service';
import TelegramService from '../services/telegram.service';
import { ConfigService } from '../services/config.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-config',
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.scss'],
})
export class ConfigPage implements OnInit, OnDestroy {

  public totalConcurrentDownloads: number = 0;
  public downloadsFolder: string = "";
  private pollingInterval: number = 5000; // Polling interval in milliseconds
  private pollingSubscription: Subscription | undefined = undefined;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private dataService: DataService,
    private configService: ConfigService,
    private alertController: AlertController,
    private telegram: TelegramService,
  ) {
    this.getTotalConcurrentDownloads();
  }

  async ngOnInit() {
    
  }

  async ionViewWillEnter() {
    if (!await this.dataService.hasKey("TELEGRAM_SESSION_STRING")) {
      console.log("NOT SESSION STIRNG RXISTS");
      this.router.navigate(["/login"]);
    } else {
      this.startPolling();
    }
  }

  ngOnDestroy() {
    console.log("Config - OnDetroy");
    this.stopPolling();
  }

  startPolling() {
    this.pollingSubscription = interval(this.pollingInterval).subscribe(() => {
      this.getTotalConcurrentDownloads();
    });
  }

  stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  getTotalConcurrentDownloads() {
    console.log("getting values");
    this.configService.getTotalConcurrentDownloads().then((value) => {
      this.totalConcurrentDownloads = value;
    }).catch(() => {
      console.log("ee");
    });
  }

  async presentInputPopup() {
    const alert = await this.alertController.create({
      header: 'Set Total Concurrent Downloads',
      inputs: [
        {
          name: 'newTotal',
          type: 'number',
          placeholder: 'Enter a new value',
          value: this.totalConcurrentDownloads.toString()
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            const newTotal = parseInt(data.newTotal);
            if (!isNaN(newTotal)) {
              this.updateTotalConcurrentDownloads(newTotal);
            }
          }
        }
      ]
    });
  
    await alert.present();
  }

  updateTotalConcurrentDownloads(newTotal: number) {
    if (newTotal > this.configService.getMaxConcurrentDownloads()) {
      this.toastController.create({
        message: "Max total concurrents downloads allowed: " + this.configService.getMaxConcurrentDownloads(),
        duration: 2000,
        position: 'bottom'
      }).then((toast) => {
        toast.present().then(() => {}).catch((err) => {console.log(err)});
      })
    }
    this.configService.setTotalConcurrentDownloads(newTotal).then(() => {
      this.totalConcurrentDownloads = newTotal;
    }).catch((error) => {
      console.error(error);
    });
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: (data) => {
            return this.logout();
          } 
        }
      ]
    });
  
    await alert.present();
  }

  private async logout() {
    await this.telegram.logOut();
    this.dataService.delete("TELEGRAM_SESSION_STRING");
    this.router.navigate(["/login"], {skipLocationChange: true});
  }

  async selectFolder() {
    this.downloadsFolder = await this.configService.getDownloadStorage();
  }

  ionViewWillLeave() {
    console.log("Config - ViewWillLeave")
  }
  
}
