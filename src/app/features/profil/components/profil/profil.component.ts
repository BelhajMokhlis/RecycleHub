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
import { CollectionRequest, CollectionRequestStatus, WasteItem } from '../../../../core/models/CollectionRequest.model';

interface UserUpdates extends Partial<User> {
  imageData?: string;
}

interface VoucherOption {
  points: number;
  value: number;
}

interface UserWithPoints extends User {
  points: number;
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
  collectionRequests: CollectionRequest[] = [];
  completedPercentage: number = 0;
  totalPoints: number = 0;
  showVoucherModal = false;

  readonly POINTS_PER_KG: { [key: string]: number } = {
    'plastique': 2,
    'verre': 1,
    'papier': 1,
    'métal': 5
  };

  readonly VOUCHER_OPTIONS: VoucherOption[] = [
    { points: 100, value: 50 },
    { points: 200, value: 120 },
    { points: 500, value: 350 }
  ];

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
        
        // Fetch collection requests for the current user
        this.indexedDBService.getAllCollectionRequests().then(requests => {
          // Filter requests for the current user
          const userRequests = requests.filter(request => request.particulierId === user.id);
          this.collectionRequests = userRequests;
          
          // Count total collection
          const totalCollections = userRequests.length;

          // Count collections with status 'completed'
          const completedCollections = userRequests.filter(request => request.status === CollectionRequestStatus.Completed).length;

          // Calculate the percentage of completed collections
          this.completedPercentage = totalCollections > 0 ? (completedCollections / totalCollections) * 100 : 0;

          // Calculate total points
          this.calculateTotalPoints(userRequests);
        });
      }
    });
  }

  calculateTotalPoints(requests: CollectionRequest[]): void {
    this.totalPoints = requests
      .filter(request => request.status === CollectionRequestStatus.Completed)
      .reduce((total, request) => {
        return total + request.wasteItems.reduce((itemTotal, item) => {
          const pointsPerKg = this.POINTS_PER_KG[item.type.toLowerCase()] || 0;
          console.log(item.type, item.estimatedWeight);
          console.log(pointsPerKg);
          return itemTotal + (pointsPerKg * (item.estimatedWeight/1000));
        }, 0);
      }, 0);
  }



  canConvertToVoucher(points: number): boolean {
    return this.VOUCHER_OPTIONS.some(option => points >= option.points);
  }

  async convertToVoucher(option: VoucherOption): Promise<void> {
    if (this.totalPoints >= option.points) {
      try {
        const currentUser = await this.indexedDBService.getCurrentUser();
        if (currentUser) {
          // Deduct points from user's total
          this.totalPoints -= option.points;
          
          // Update user's points in the database
          const userWithPoints = currentUser as UserWithPoints;
          userWithPoints.points = this.totalPoints;
          
          await this.indexedDBService.updateUser(currentUser, { points: this.totalPoints } as Partial<UserWithPoints>);
          
          // Show success message or handle voucher generation
          alert(`Successfully generated a voucher worth ${option.value} Dh!`);
        }
      } catch (error) {
        console.error('Error converting points to voucher:', error);
        alert('Failed to convert points to voucher. Please try again.');
      }
    } else {
      alert('Insufficient points for this voucher.');
    }
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

