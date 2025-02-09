import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitted = false;
  errorMessage: string = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onSubmit(): Promise<void> {
    this.isSubmitted = true;
    this.errorMessage = '';

    if (this.loginForm.valid) {
      try {
        const { email, password } = this.loginForm.value;
        const user = await this.authService.login(email, password);
        
      
          this.router.navigate(['/home']);
        
      } catch (error: any) {
        this.errorMessage = error.message || 'Login failed. Please try again.';
      }
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
