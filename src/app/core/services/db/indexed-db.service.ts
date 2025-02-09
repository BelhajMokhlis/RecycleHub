import { Injectable } from '@angular/core';
import { User, UserRole } from '../../models/user.model';
import { CollectionRequest, CollectionRequestStatus } from '../../models/CollectionRequest.model';
import { CollectionImage } from '../../models/CollectionImage.model';
import { UserImage } from '../../models/UserImage.model';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  private dbName = 'recycle-app';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private dbReady: Promise<void>;

  private readonly STORES = {
    USERS: 'users',
    COLLECTION_REQUESTS: 'collectionRequests',
    COLLECTION_IMAGES: 'collectionImages',
    USER_IMAGES: 'userImages'
  };

  constructor() {
    this.dbReady = this.openDatabase();
  }

  private openDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Users store
        if (!db.objectStoreNames.contains(this.STORES.USERS)) {
          const userStore = db.createObjectStore(this.STORES.USERS, { keyPath: 'email' });
          userStore.createIndex('role', 'role');
        }

        // Collection Requests store
        if (!db.objectStoreNames.contains(this.STORES.COLLECTION_REQUESTS)) {
          const requestStore = db.createObjectStore(this.STORES.COLLECTION_REQUESTS, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          requestStore.createIndex('status', 'status');
          requestStore.createIndex('collectionAddress', 'collectionAddress');
        }

        // Collection Images store
        if (!db.objectStoreNames.contains(this.STORES.COLLECTION_IMAGES)) {
          const imageStore = db.createObjectStore(this.STORES.COLLECTION_IMAGES, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          imageStore.createIndex('collectionRequestId', 'collectionRequestId');
        }

        // User Images store
        if (!db.objectStoreNames.contains(this.STORES.USER_IMAGES)) {
          const userImageStore = db.createObjectStore(this.STORES.USER_IMAGES, { 
            keyPath: 'id'
          });
          userImageStore.createIndex('userId', 'userId');
        }
      };

      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('Database opened successfully');
        resolve();
      };

      request.onerror = (event: Event) => {
        console.error('Database error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  public waitForConnection(): Promise<void> {
    return this.dbReady;
  }

  // Generic add method
  public async add<T>(storeName: string, data: T): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database is not initialized');
        return;
      }
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => {
        resolve(request.result as number);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Generic get method
  public async get<T>(storeName: string, key: string | number): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database is not initialized');
        return;
      }
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Generic getAll method
  public async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database is not initialized');
        return;
      }
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Generic update method
  public async update<T>(storeName: string, key: string | number, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database is not initialized');
        return;
      }
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Generic delete method
  public async delete(storeName: string, key: string | number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database is not initialized');
        return;
      }
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error('Error deleting data:', request.error);
        reject(request.error);
      };
    });
  }

  // Specific methods for each model
  public addUser(user: User): Promise<number> {
    return this.add(this.STORES.USERS, user);
  }

  public addCollectionRequest(request: CollectionRequest): Promise<number> {
    return this.add(this.STORES.COLLECTION_REQUESTS, request);
  }

  public addCollectionImage(image: CollectionImage): Promise<number> {
    return this.add(this.STORES.COLLECTION_IMAGES, image);
  }

  public async addUserImage(userImage: UserImage): Promise<void> {
    try {
      console.log('Storing user image:', userImage.id);
      const transaction = this.db!.transaction(this.STORES.USER_IMAGES, 'readwrite');
      const store = transaction.objectStore(this.STORES.USER_IMAGES);
      
      return new Promise((resolve, reject) => {
        const request = store.add(userImage);
        request.onsuccess = () => {
          console.log('Image stored successfully');
          resolve();
        };
        request.onerror = () => {
          console.error('Error storing image:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in addUserImage:', error);
      throw error;
    }
  }

  // Get methods
  public getUser(email: string): Promise<User> {
    return this.get(this.STORES.USERS, email);
  }

  public getCollectionRequest(id: number): Promise<CollectionRequest> {
    return this.get(this.STORES.COLLECTION_REQUESTS, id);
  }

  public getAllUsers(): Promise<User[]> {
    return this.getAll(this.STORES.USERS);
  }

  public getAllCollectionRequests(): Promise<CollectionRequest[]> {
    return this.getAll(this.STORES.COLLECTION_REQUESTS);
  }

  // Add this method to the IndexedDBService class
  public async updateUser(user: User, updates: Partial<User>): Promise<void> {
    try {
      const updatedUser = { 
        ...user, 
        ...updates, 
        updatedAt: new Date().toISOString(),
        // Make sure we keep the id as it's our key
        id: user.id 
      };
      
      return this.update(this.STORES.USERS, user.id, updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  public async getDataCount(): Promise<number> {
    const users = await this.getAllUsers();
    return users.length;
  }

  public async getUserImage(userId: string): Promise<UserImage | null> {
    try {
      await this.waitForConnection();
      
      const transaction = this.db!.transaction(this.STORES.USER_IMAGES, 'readonly');
      const store = transaction.objectStore(this.STORES.USER_IMAGES);
      
      return new Promise((resolve, reject) => {
        const request = store.get(userId); // Use userId as the key since that's how we stored it
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('Error fetching image:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getUserImage:', error);
      throw error;
    }
  }

  async initDB(): Promise<void> {
    if (this.db) return; // Already initialized

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
          userStore.createIndex('isActive', 'isActive');
        }
        if (!db.objectStoreNames.contains('userImages')) {
          db.createObjectStore('userImages', { keyPath: 'userId' });
        }
      };
    });
  }

  public async updateUserImage(userImage: UserImage): Promise<void> {
    try {
      console.log('Attempting to update user image:', userImage.id);
      const transaction = this.db!.transaction(this.STORES.USER_IMAGES, 'readwrite');
      const store = transaction.objectStore(this.STORES.USER_IMAGES);
      
      return new Promise((resolve, reject) => {
        const request = store.put(userImage); // put will update if exists, add if doesn't
        request.onsuccess = () => {
          console.log('Image updated successfully');
          resolve();
        };
        request.onerror = () => {
          console.error('Error updating image:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in updateUserImage:', error);
      throw error;
    }
  }


  public async getCurrentUser(): Promise<User | null> {
    // current user is the user hase isActive true
    
    const users = await this.getAllUsers();
    const user: User | null = users.find(user => user.isActive) || null;
    if (user) {
      user.imageUrl = (await this.getUserImage(user.id))?.data || undefined;
    }
    return user;
  } 


}
