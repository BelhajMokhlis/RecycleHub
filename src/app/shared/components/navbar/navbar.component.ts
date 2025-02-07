import { Component } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'home-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  currentUser: User | null = null;
  userImage: string | null = null;
  
  constructor(private authService: AuthService) {
    this.authService.getCurrentUser().then(user => {
      this.currentUser = user;
      if (this.currentUser) {
        this.authService.getUserImage(this.currentUser.id)
          .then(imageUrl => {
            this.userImage = imageUrl;
            console.log(this.userImage + 'userImage');
          })
          .catch(() => {
            this.userImage = '/assets/image/user-avatar.png';
          });
      } else {
        this.userImage = '/assets/image/user-avatar.png';
        console.log(this.userImage);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }


}
