import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { IndexedDBService } from './core/services/db/indexed-db.service';
import { User, UserRole } from './core/models/user.model';
import { CollectionRequest, CollectionRequestStatus } from './core/models/CollectionRequest.model';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'RecycleHub';

  isLoggedIn = true; // or however you determine login status
  
  constructor(private indexedDBService: IndexedDBService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isLoggedIn = !(event.url.includes('/login') || event.url.includes('/register'));
      console.log('isLoggedIn:', this.isLoggedIn);
    });
  }

  async ngOnInit() {
    this.indexedDBService.waitForConnection()
      .then(() => this.checkDatabaseForData())
      .then(hasData => {
        if (!hasData) {
          return this.addTestData();
        }
      })
      .catch(error => console.error('Failed to connect to database:', error));
  }

  private addTestData() {
    const collecteur = this.collecteur();
    const particulier = this.particulier();
    const testRequest = this.createTestCollectionRequest();

    Promise.all([
      this.indexedDBService.addUser(collecteur),
      this.indexedDBService.addUser(particulier),
      this.indexedDBService.addCollectionRequest(testRequest)
    ])
      .then(() => {
        console.log('Test data added successfully');
      })
      .catch((error: Error) => {
        console.error('Error adding test data:', error);
      });
  }

  private collecteur(): User {
    return {
      id: '2',
      email: 'collecteur@example.com',
      password: 'hashedPassword',
      firstName: 'Collecteur',
      lastName: 'Doe',
      ville: 'Rabat',
      phoneNumber: '1234567890',
      birthDate: new Date(),
      isActive: false,
      role: UserRole.Collecteur,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private particulier(): User {
    return {
      id: '1',
      email: 'Particulier@example.com',
      password: 'hashedPassword',
      firstName: 'Particulier',
      lastName: 'Doe',
      ville: 'Rabat',
      phoneNumber: '1234567890',
      isActive: false,
      birthDate: new Date(),
      role: UserRole.Particulier,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private createTestCollectionRequest(): CollectionRequest {
    return {
      wasteItems: [
        { type: 'plastique', estimatedWeight: 5 },
        { type: 'verre', estimatedWeight: 3 }
      ],
      collectionAddress: '123 Main St',
      preferredDateTime: {
        date: '2024-02-10',
        timeSlot: '10:00-12:00'
      },
      status: CollectionRequestStatus.Pending,
      particulierId: '1'
    };
  }

  checkDatabaseForData(): Promise<boolean> {
    return this.indexedDBService.getDataCount() // Assuming getDataCount() returns a promise with the count of records
      .then(count => count > 0);
  }
}
