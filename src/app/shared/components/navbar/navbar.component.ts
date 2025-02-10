import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectProfileUser } from '../../../features/profil/store/profile.selectors';
import { User } from '../../../core/models/user.model';
import { Subscription } from 'rxjs';
import { ProfileState } from '../../../features/profil/store/profile.reducer';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { IndexedDBService } from '../../../core/services/db/indexed-db.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private userSubscription: Subscription | null = null;
  isMenuOpen = false;
  defaultImage = 'https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg';




  constructor(
    private store: Store<{ profile: ProfileState }>,
    private authService: AuthService,
    private indexedDBService: IndexedDBService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Use store subscription to keep UI in sync with state
    this.userSubscription = this.store.select(selectProfileUser)
      .subscribe(user => {
        this.currentUser = user;
      });


    try {
      // Wait for DB to be initialized
      await this.indexedDBService.waitForConnection();
      // Initial load of current user
      const user = await this.indexedDBService.getCurrentUser();
      if (user) {
        this.store.dispatch({ type: '[Profile] Update Profile Success', user });
      }
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async logout() {
    try {
      await this.indexedDBService.waitForConnection();
      const currentUser = await this.indexedDBService.getCurrentUser();
      if (currentUser) {
        await this.indexedDBService.updateUser(currentUser, {
          isActive: false,
          updatedAt: new Date().toISOString()
        });
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Still navigate to login in case of error
      this.router.navigate(['/login']);
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
