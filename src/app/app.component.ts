import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Platform } from '@ionic/angular';
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private router: Router,
    private navController: NavController
  ) {
    this.platform.backButton.subscribeWithPriority(-1, () => {
      const url = this.router.url;

      if (url === "/config") {
        this.navController.pop().then((value) => {}).catch((err) => {});
      }
    })
  }
}
