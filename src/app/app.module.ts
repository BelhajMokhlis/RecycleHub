import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { routes } from './app.routes';
import { AuthModule } from './features/auth/auth.module';
import { HomeModule } from './features/home/home.module';
import { ProfilModule } from './features/profil/profil.module';
import { profileReducer } from './features/profil/store/profile.reducer';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    StoreModule.forRoot({
      profile: profileReducer
    }),
    AuthModule,
    HomeModule,
    ProfilModule,
    NavbarComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { } 