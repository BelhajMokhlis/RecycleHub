import { Routes } from '@angular/router';
import { ProfilComponent } from './features/profil/components/profil/profil.component';
import { HomeComponent } from './features/home/components/home/home.component';
import { AuthGuard } from './core/guards/auth/auth.guard';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { CurrentUserResolver } from './core/resolvers/user/current-user.resolver';
import { VilleResolver } from './core/resolvers/ville/ville.resolver';


export const routes: Routes = [
  { 
    path: 'home', 
    component: HomeComponent,
    canActivate: [AuthGuard],
    resolve: {
      currentUser: CurrentUserResolver,
      ville: VilleResolver
    }
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
