import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PasswordConfirmPageRoutingModule } from './password-confirm-routing.module';

import { PasswordConfirmPage } from './password-confirm.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PasswordConfirmPageRoutingModule
  ],
  declarations: [PasswordConfirmPage]
})
export class PasswordConfirmPageModule {}
