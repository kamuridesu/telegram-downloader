import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PhoneloginPageRoutingModule } from './phonelogin-routing.module';

import { PhoneloginPage } from './phonelogin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PhoneloginPageRoutingModule
  ],
  declarations: [PhoneloginPage]
})
export class PhoneloginPageModule {}
