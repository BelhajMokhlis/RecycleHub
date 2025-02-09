import { Routes } from '@angular/router';
import { ProfilComponent } from './features/profil/components/profil/profil.component';
import { HomeComponent } from './features/home/components/home/home.component';
import { AuthGuard } from './core/guards/auth/auth.guard';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';

export const routes: Routes = [
  { 
    path: 'home', 
    component: HomeComponent ,
    canActivate: [AuthGuard]
  },
  { 
    path: 'profil', 
    component: ProfilComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: '', 
    redirectTo: '/home', 
    pathMatch: 'full' 
  }
];
