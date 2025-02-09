import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Store } from '@ngrx/store';
import * as ProfileActions from '../../../features/profil/store/profile.actions';
import { ProfileState } from '../../../features/profil/store/profile.reducer';
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  @Input() user: any;
  @Output() closeModal = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<any>();

  cities: string[] = [];
  userForm!: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private store: Store<{ profile: ProfileState }>
  ) {}
  

  ngOnInit() {
    this.authService.getCities().subscribe(response => {
      this.cities = response.results.map(cityData => cityData.asciiname);
    });
    this.userForm = this.fb.group({
      firstName: [this.user?.firstName || '', Validators.required],
      lastName: [this.user?.lastName || '', Validators.required],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      phoneNumber: [this.user?.phoneNumber || '', Validators.required],
      birthDate: [this.user?.birthDate || '', Validators.required],
      city: [this.user?.ville || '', Validators.required]
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      // Only include changed form values
      const changedValues = Object.keys(this.userForm.controls)
        .reduce((acc, key) => {
          if (this.userForm.get(key)?.dirty) {
            acc[key] = this.userForm.get(key)?.value;
          }
          return acc;
        }, {} as any);

      // Map city to ville if it was changed
      if (changedValues.city) {
        changedValues.ville = changedValues.city;
        delete changedValues.city;
      }

      // Handle image separately
      if (this.imagePreview) {
        changedValues.imageData = this.imagePreview;
      }

      this.userUpdated.emit(changedValues);
      this.close();
    }
  }

  close() {
    this.closeModal.emit();
  }

  onImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        // Mark the form as dirty when an image is selected
        this.userForm.markAsDirty();
      };
      reader.readAsDataURL(file);
    }
  }
}
