import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { User } from '../../models/user.model';
import { Observable, from } from 'rxjs';
import { IndexedDBService } from '../../services/db/indexed-db.service';

@Injectable({
  providedIn: 'root'
})

export class CurrentUserResolver implements Resolve<User | null> {
  constructor(private indexedDBService: IndexedDBService) {}


  resolve(): Observable<User | null> {
    return from(this.indexedDBService.getCurrentUser());
  }

} 