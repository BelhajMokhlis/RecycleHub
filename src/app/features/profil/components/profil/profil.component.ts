import { Component } from '@angular/core';
import { User } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { UserFormComponent } from '../../../../shared/components/user-form/user-form.component';
import { Store } from '@ngrx/store';
import { selectProfileUser } from '../../store/profile.selectors';
import * as ProfileActions from '../../store/profile.actions';
import { IndexedDBService } from '../../../../core/services/db/indexed-db.service';
import { ProfileState } from '../../store/profile.reducer';
import { Router } from '@angular/router';
import { UserImage } from '../../../../core/models/UserImage.model';

interface UserUpdates extends Partial<User> {
  imageData?: string;
}

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [
    CommonModule,
    UserFormComponent,
  ],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent {
  currentUser$;
  isUserFormOpen = false;

  constructor(
    private authService: AuthService,
    private store: Store<{ profile: ProfileState }>,
    private indexedDBService: IndexedDBService,
    private router: Router
  ) {
    this.currentUser$ = this.store.select(selectProfileUser);
    this.indexedDBService.getCurrentUser().then(user => {
      if (user) {
        this.store.dispatch(ProfileActions.updateProfileSuccess({ user }));
      }
    });
  }

  openUserForm() {
    this.isUserFormOpen = true;
  }

  closeUserForm() {
    this.isUserFormOpen = false;
  }

  async onUserUpdated(updates: UserUpdates) {
    try {
      const currentUser = await this.indexedDBService.getCurrentUser();
      if (currentUser) {
        // Handle image update if provided
        if (updates.imageData) {
          // Delete existing image if it exists
          try {
            await this.indexedDBService.delete('userImages', currentUser.id);
          } catch (error) {
            console.log('No existing image to delete');
          }

          // Add new image
          const userImage: UserImage = {
            id: currentUser.id,
            userId: currentUser.id,
            data: updates.imageData,
            type: 'image/jpeg'
          };
          await this.indexedDBService.addUserImage(userImage);
          
          // Update image URL in updates
          updates.imageUrl = updates.imageData;
          // Remove imageData from updates as it's not part of User model
          delete updates.imageData;
        }

        // Update user data
        const updatedUser = {
          ...currentUser,
          ...updates,
          id: currentUser.id,
          email: currentUser.email
        };
        
        await this.indexedDBService.updateUser(currentUser, updates);
        this.store.dispatch(ProfileActions.updateProfileSuccess({ user: updatedUser }));
      } else {
        console.error('No current user found');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
    this.closeUserForm();
  }
  
  deleteProfile(id: string) {
    this.indexedDBService.delete('users', id).then(() => {
      this.router.navigate(['/login']);
    });
  }


}

