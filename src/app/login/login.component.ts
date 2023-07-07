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
      console.log("SESSION STIRNG RXISTS");
      this.router.navigate(["/chats"]);
    } else {
      console.log("NOT SESSION STIRNG RXISTS");
      this.router.navigate(["/phonelogin"]);
    }
  }

  ngOnDestroy() {
    console.log("LoginPage - OnDestroy")
  }
    

  async ionViewWillEnter() {
    if (await this.dataService.hasKey("TELEGRAM_SESSION_STRING")) {
      console.log("SESSION STIRNG RXISTS");
      this.router.navigate(["/chats"]);
    } else {
      console.log("NOT SESSION STIRNG RXISTS");
      this.router.navigate(["/phonelogin"]);
    }
  }

  ionViewWillLeave() {
    console.log("LoginPage - ViewWillLeave")
  }

}