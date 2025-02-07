import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  currentUser: User | null = null;
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    this.currentUser = await this.authService.getCurrentUser();
    const isLoginOrRegister = state.url.includes('/login') || state.url.includes('/register');
    
    if (this.currentUser?.isActive) {
      if (isLoginOrRegister) {
        this.router.navigate(['/home']);
        return true;
      }else{
        return true;
      }
    }else{
      if (isLoginOrRegister) {
        return true;
      }
    }

    this.router.navigate(['/login']);
    return false;
  }

}


