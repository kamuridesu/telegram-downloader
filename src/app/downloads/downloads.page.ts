import { Component, OnInit } from '@angular/core';

import { AlertController } from '@ionic/angular';

import { DownloadsService } from '../services/downloads.service';

@Component({
  selector: 'app-downloads',
  templateUrl: './downloads.page.html',
  styleUrls: ['./downloads.page.scss'],
})
export class DownloadsPage implements OnInit {

  constructor(
    private alertController: AlertController,
    public downloads: DownloadsService
  ) {
    
  }

  private async sortItems() {
    this.downloads.status = "DOWNLOADING";
    const sortOrder: string[] = ['downloading','completed', 'error', 'pending'];
    this.downloads.mediasData.sort(
      (a, b) => {
          if(a.type == b.type){
            return a.filename.localeCompare(b.filename);
          }
          return sortOrder.indexOf(a.type) - sortOrder.indexOf(b.type);
      });
    }

  ngOnInit() {
  }

  async testSaveFile() {
    // await this.downloads.start();
    await this.downloads.test();
  }

  async presentInputPopup(item: any) {
    const alert = await this.alertController.create({
      header: `Are you sure you want to delete ${item.filename}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            console.log(item);
          },
        }
      ]
    });
  
    await alert.present();
  }


  async ionViewWillEnter() {
    await this.downloads.init();
    setInterval(() => {
      this.sortItems();
    }, 500);
  }
}
