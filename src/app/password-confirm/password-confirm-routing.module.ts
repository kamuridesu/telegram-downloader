import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PasswordConfirmPage } from './password-confirm.page';

const routes: Routes = [
  {
    path: '',
    component: PasswordConfirmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PasswordConfirmPageRoutingModule {}
