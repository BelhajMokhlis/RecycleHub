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
   
    if (user) {
      const updatedUser = { ...user, ...updates };
      return this.update(this.STORES.USERS, user.email, updatedUser);
    }
    throw new Error('User not found');
  }

  public async getDataCount(): Promise<number> {
    const users = await this.getAllUsers();
    return users.length;
  }

  public async getUserImage(userId: string): Promise<UserImage | null> {
    try {
      await this.waitForConnection();
      console.log('Fetching image for user:', userId);
      
      const transaction = this.db!.transaction(this.STORES.USER_IMAGES, 'readonly');
      const store = transaction.objectStore(this.STORES.USER_IMAGES);
      
      return new Promise((resolve, reject) => {
        const request = store.get(userId); // Use userId as the key since that's how we stored it
        
        request.onsuccess = () => {
          console.log('Image fetch result:', request.result);
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
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('userImages')) {
          db.createObjectStore('userImages', { keyPath: 'userId' });
        }
      };
    });
  }
}
