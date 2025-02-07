import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { User, UserRole } from '../../models/user.model';
import { IndexedDBService } from '../db/indexed-db.service';
import { Router } from '@angular/router';
import { UserImage } from '../../models/UserImage.model';

interface CityResponse {
  results: {
    objectId: string;
    asciiname: string;
    createdAt: string;
    updatedAt: string;
  }[];
}



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private indexedDB: IndexedDBService,
    private router: Router
  ) {
    // Initialize the database when AuthService is created
    this.indexedDB.initDB().catch(error => {
      console.error('Failed to initialize database:', error);
    });
  }

  getCities(): Observable<CityResponse> {
    return this.http.get<CityResponse>('https://parseapi.back4app.com/classes/List_of_Morroco_cities?order=asciiname&keys=asciiname', {
      headers: {
        'X-Parse-Application-Id': '2ZOfB60kP39M5kE4WynRqyP7lNGKZ9MB8fVWqAM9',
        'X-Parse-Master-Key': 'Qq7lEIoEEzRris3IM6POE5ewvYuzACVyA6VKtiVb'
      }
    });
  }

  async register(userData: User , image: UserImage): Promise<void> {
    try {
      // Create user object with default role
      const user: User = {
        ...userData,
        // generate a random id string
        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        role: UserRole.Particulier,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save user to IndexedDB
      await this.indexedDB.addUser(user);

      if (image) {
        // Save image to IndexedDB
        image.id = user.id;
        await this.indexedDB.addUserImage(image);
        console.log("userImage");
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const user = await this.indexedDB.getUser(email);
      console.log(user);
      
      if (!user) {
        throw new Error('User not found');
      }

      if (user.password !== password) {
        throw new Error('Invalid password');
      }

      // set isActive to true in indexedDB
     await this.indexedDB.updateUser(user, { isActive: true });
      
      return user;
    } catch (error) {
      console.log(error +"errorcvfvbhj");
      throw error;
   
    }
  }

  async logout(): Promise<void> {
    const currentUser = await this.getCurrentUser();
    if (currentUser) {
      await this.indexedDB.updateUser(currentUser, { isActive: false });
    }
    this.router.navigate(['/login']);
  }

  async getCurrentUser(): Promise<User | null> {
    await this.indexedDB.initDB(); // Ensure DB is initialized before querying
    const users = await this.indexedDB.getAllUsers();
    return users.find(user => user.isActive) || null;
  }

  async isLoggedIn(): Promise<boolean> {
    return !!(await this.getCurrentUser());
  }


  convertBase64ToBlob(base64String: string): Blob {
    // Remove data URL prefix if present
    const base64 = base64String.split(',')[1] || base64String;
    
    try {
      const byteCharacters = atob(base64);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      return new Blob(byteArrays, { type: 'image/jpeg' });
    } catch (error) {
      console.error('Error converting base64 to blob:', error);
      throw new Error('Invalid base64 string');
    }
  }

  async getUserImage(userId: string): Promise<string> {
    try {
      const userImage = await this.indexedDB.getUserImage(userId);
      
      if (!userImage || !userImage.data) {
        console.log('No image found for user:', userId);
        return '/assets/image/user-avatar.png'; // Return default image path
      }

      return userImage.data; // The data is already a base64 string
    } catch (error) {
      console.error('Error retrieving user image:', error);
      return '/assets/image/user-avatar.png'; // Return default image on error
    }
  }
}
