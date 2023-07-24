import { Component, OnInit } from '@angular/core';

import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

import { DownloadsService } from '../services/downloads.service';

@Component({
  selector: 'app-downloads',
  templateUrl: './downloads.page.html',
  styleUrls: ['./downloads.page.scss'],
})
export class DownloadsPage implements OnInit {

  public items: any[] = [];
  public pending: number = 0;
  public completed: number = 0;
  public downloading: number = 0;
  public error: number = 0;
  public MAX_SHOW_ITEMS = 100;

  constructor(
    private alertController: AlertController,
    private router: Router,
    public downloads: DownloadsService,
  ) {
    
  }

  private async sortItems() {
    this.items = [...this.downloads.mediasData];
    this.error = this.downloads.mediasData.filter(value => value.type == "error").length
    this.pending = this.downloads.mediasData.filter(value => value.type == "pending").length
    this.completed = this.downloads.mediasData.filter(value => value.type == "completed").length
    this.downloading = this.downloads.mediasData.filter(value => value.type == "downloading").length
    const sortOrder: string[] = ['downloading', 'pending', 'completed', 'error'];
    this.items.sort(
      (a, b) => {
          if(a.type == b.type){
            return a.filename.localeCompare(b.filename);
          }
          return sortOrder.indexOf(a.type) - sortOrder.indexOf(b.type);
    });
    this.items = this.items.slice(0, this.MAX_SHOW_ITEMS);
  }

  ngOnInit() {
  }

  async removeItemPopUp(item: any) {
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
            this.downloads.deleteItem(item);
          },
        }
      ]
    });
  
    await alert.present();
  }

  async stopDownloadsPopUp() {
    const alert = await this.alertController.create({
      header: `Are you sure you want to stop all downloads?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete All',
          handler: async () => {
            await this.downloads.cancelAll();
            return this.router.navigate(["/chats"])
          },
        }
      ]
    });
  
    await alert.present();
  }

  async ionViewWillEnter(): Promise<any> {
    await this.downloads.init();

    if (this.downloads.status == "WAITING") return this.router.navigate(["/chats"]);

    setInterval(() => {
      this.sortItems();
    }, 2000);
  }
}
