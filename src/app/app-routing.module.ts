import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { HomeComponent } from './features/home/components/home/home.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { AuthGuard } from './core/guards/auth/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  {path: 'register', component:RegisterComponent},
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }  

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 