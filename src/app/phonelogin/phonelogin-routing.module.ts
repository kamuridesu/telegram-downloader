import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PhoneloginPage } from './phonelogin.page';

const routes: Routes = [
  {
    path: '',
    component: PhoneloginPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PhoneloginPageRoutingModule {}
