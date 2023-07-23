import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";

import { DataService } from '../services/data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  constructor(private dataService: DataService, private router: Router) { }

  async ngOnInit() {
    if (await this.dataService.hasKey("TELEGRAM_SESSION_STRING")) {
      this.router.navigate(["/chats"]);
    } else {
      this.router.navigate(["/phonelogin"]);
    }
  }

  ngOnDestroy() {
  }
    

  async ionViewWillEnter() {
    if (await this.dataService.hasKey("TELEGRAM_SESSION_STRING")) {
      this.router.navigate(["/chats"]);
    } else {
      this.router.navigate(["/phonelogin"]);
    }
  }

  ionViewWillLeave() {
  }

}