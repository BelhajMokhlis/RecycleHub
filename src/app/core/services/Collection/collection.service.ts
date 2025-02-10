import { Injectable } from '@angular/core';
import { Observable, from, of, switchMap, throwError } from 'rxjs';
import { CollectionRequest, CollectionRequestStatus, WasteItem } from '../../models/CollectionRequest.model';
import { IndexedDBService } from '../db/indexed-db.service';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  newCollectionRequest: CollectionRequest = {
    wasteItems: [],
    ville: '',
    collectionAddress: '',
    preferredDateTime: { date: '', timeSlot: '' },
    status: CollectionRequestStatus.Pending,
    particulierId: ''

  };
  constructor(private indexedDBService: IndexedDBService) {}



  getCollectionRequests(): Observable<CollectionRequest[]> {
    return from(this.indexedDBService.getAllCollectionRequests());
  }

  createCollectionRequest(form: FormGroup): Observable<CollectionRequest> {
    const formValue = form.value;
    const wasteItems = formValue.wasteItems || [];

    if (!wasteItems) {
      console.error('Error: wasteItems is missing from the form data.');
      return of(this.newCollectionRequest);
    }

    wasteItems.forEach((item: WasteItem) => {
      this.newCollectionRequest.wasteItems.push(item);
    });
    const totalWeight = wasteItems.reduce((sum: number, item: WasteItem) => sum + item.estimatedWeight, formValue.totalWeight);
    console.log("totalWeight", totalWeight);
    if (totalWeight > 10000) {
      const posibleWeight = 10000 - formValue.totalWeight;
      return throwError(() => new Error(`Weight must be less than 10000g. You can still add ${posibleWeight}g`));
    }









    this.newCollectionRequest.ville = formValue.ville || '';
    this.newCollectionRequest.collectionAddress = formValue.collectionAddress || '';
    this.newCollectionRequest.preferredDateTime = formValue.preferredDateTime || { date: '', timeSlot: '' };
    this.newCollectionRequest.status = formValue.status || CollectionRequestStatus.Pending;
    this.newCollectionRequest.particulierId = formValue.particulierId || '';

    if (formValue.preferredDateTime) {
      this.newCollectionRequest.preferredDateTime.timeSlot = `${formValue.preferredDateTime.timeSlot1}-${formValue.preferredDateTime.timeSlot2}`;
    }

    console.log(this.newCollectionRequest);
    return from(this.indexedDBService.addCollectionRequest(this.newCollectionRequest)).pipe(
      switchMap(() => of(this.newCollectionRequest))
    );
  }

  deleteCollectionRequest(requestId: string): Observable<void> {
    return from(this.indexedDBService.delete('collectionRequests', requestId)).pipe(
      switchMap(() => of(void 0))
    );
  }
}
