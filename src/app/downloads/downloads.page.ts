import { Component, OnInit } from '@angular/core';

import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-downloads',
  templateUrl: './downloads.page.html',
  styleUrls: ['./downloads.page.scss'],
})
export class DownloadsPage implements OnInit {

  items: any[] = [];

  constructor(
    private alertController: AlertController
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
    const sortOrder: any = ['downloading','completed', 'pending'];
    this.items.sort(
      function(a, b){                              // Pass a function to the sort that takes 2 elements to compare
          if(a.type == b.type){                    // If the elements both have the same `type`,
              return a.name.localeCompare(b.name); // Compare the elements by `name`.
          }else{                                   // Otherwise,
              return sortOrder.indexOf(a.type) - sortOrder.indexOf(b.type); // Substract indexes, If element `a` comes first in the array, the returned value will be negative, resulting in it being sorted before `b`, and vice versa.
          }
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
