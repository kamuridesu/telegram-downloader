import { Component, OnInit } from '@angular/core';

import { AlertController } from '@ionic/angular';

import { DownloadsService } from '../services/downloads.service';

@Component({
  selector: 'app-downloads',
  templateUrl: './downloads.page.html',
  styleUrls: ['./downloads.page.scss'],
})
export class DownloadsPage implements OnInit {

  items: any[] = [];

  constructor(
    private alertController: AlertController,
    public downloads: DownloadsService
  ) {
    this.items = [
      {
        filename: "testsfile1",
        type: "pending",
        color: "warning",
        progress: 0,
        completed: false,
      },
      {
        filename: "testsfile2",
        type: "downloading",
        color: "",
        progress: 0.5,
        completed: false,
      },
      {
        filename: "testsfile3",
        type: "completed",
        color: "success",
        progress: 1,
        completed: true,
      },
    ]
  }

  private async sortItems() {
    const sortOrder: string[] = ['downloading','completed', 'pending'];
    this.items.sort(
      (a, b) => {
          if(a.type == b.type){
            return a.filename.localeCompare(b.filename);
          }
          return sortOrder.indexOf(a.type) - sortOrder.indexOf(b.type);
      });
    }

  ngOnInit() {
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
    setInterval(() => {
      this.sortItems();
    }, 500);
  }

}
