import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User, UserRole } from '../../../../core/models/user.model';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { UserImage } from '../../../../core/models/UserImage.model';

interface CityResponse {
  results: {
    objectId: string;
    asciiname: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  showPassword = false;
  UserRole = UserRole;
  selectedImage: string | ArrayBuffer | null = null;
  cities: string[] = [];
  isSubmitted = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getCities().subscribe(response => {
      this.cities = response.results.map(cityData => cityData.asciiname);
    });
    
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      ville: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      birthDate: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const userData: User = {
        ...this.registerForm.value,
        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        role: UserRole.Particulier,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const userImage: UserImage = {
        id: userData.id,
        userId: userData.id,
        data: this.selectedImage?.toString() || '',
        type: 'image/jpeg'
      };

      console.log('Saving image:', userImage);

      this.authService.register(userData, userImage)
        .then(() => {
          this.router.navigate(['/login']);
        })
        .catch(error => {
          console.error('Registration error:', error);
          this.errorMessage = error.message || 'Registration failed. Please try again.';
        });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result;
        console.log('Image loaded:', this.selectedImage?.toString().substring(0, 50) + '...');
      };
      reader.readAsDataURL(file);
    }
  }
}
