import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { CollectionCardComponent } from '../../shared/components/collection-card/collection-card.component';
import { CollectionFormComponent } from '../../shared/components/collection-form/collection-form.component';
import { CollectionValidationComponent } from '../../shared/components/collection-validation/collection-validation.component';
@NgModule({
  declarations: [
    HomeComponent
  ],

  imports: [
    CommonModule,
    NavbarComponent,
    CollectionCardComponent,
    CollectionFormComponent,
    CollectionValidationComponent
  ]
})
export class HomeModule { } 