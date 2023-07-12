import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'chats',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'phonelogin',
    loadChildren: () => import('./phonelogin/phonelogin.module').then( m => m.PhoneloginPageModule)
  },
  {
    path: 'confirm-code',
    loadChildren: () => import('./confirm-code/confirm-code.module').then( m => m.ConfirmCodePageModule)
  },
  {
    path: 'password-confirm',
    loadChildren: () => import('./password-confirm/password-confirm.module').then( m => m.PasswordConfirmPageModule)
  },
  {
    path: 'chats',
    loadChildren: () => import('./chats/chats.module').then( m => m.ChatsPageModule)
  },
  {
    path: 'config',
    loadChildren: () => import('./config/config.module').then( m => m.ConfigPageModule)
  },
  {
    path: 'downloads',
    loadChildren: () => import('./downloads/downloads.module').then( m => m.DownloadsPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
