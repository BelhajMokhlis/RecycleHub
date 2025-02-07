import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { RouterModule } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LoginComponent,
    RegisterComponent
  ]
})
export class AuthModule { } 