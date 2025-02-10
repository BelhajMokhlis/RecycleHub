import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectionRequest, CollectionRequestStatus } from '../../../core/models/CollectionRequest.model';
import { IndexedDBService } from '../../../core/services/db/indexed-db.service';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-collection-validation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collection-validation.component.html',
  styleUrl: './collection-validation.component.scss'
})
export class CollectionValidationComponent implements OnInit {
  status: CollectionRequestStatus = CollectionRequestStatus.Pending;
  @Input() collectionRequest?: CollectionRequest;
  userCollections: CollectionRequest[] = [];
  // Make CollectionRequestStatus available in template
  protected CollectionRequestStatus = CollectionRequestStatus;

  @Output() closeValidationModal = new EventEmitter<void>();

  constructor(
    private indexedDBService: IndexedDBService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.loadUserCollections();
  }

  async loadUserCollections() {
    try {
      const currentUser = await this.authService.getCurrentUser();
      if (currentUser) {
        const allCollections = await this.indexedDBService.getAll<CollectionRequest>('collectionRequests');
        this.userCollections = allCollections.filter(collection => collection.particulierId === currentUser.id);
        
        // If no collection is selected and we have collections, select the first one
        if (!this.collectionRequest && this.userCollections.length > 0) {
          this.collectionRequest = this.userCollections[0];
          this.status = this.collectionRequest.status;
        }
      }
    } catch (error) {
      console.error('Error loading user collections:', error);
    }
  }

  async onSubmit() {
    if (this.collectionRequest && this.collectionRequest.id) {
      try {
        // Update the status in the collection request
        this.collectionRequest.status = this.status;
        
        // Update in IndexedDB
        await this.indexedDBService.update(
          'collectionRequests', 
          this.collectionRequest.id, 
          this.collectionRequest
        );
        
        console.log('Collection request updated successfully');
        // Reload collections after update
        await this.loadUserCollections();
        this.closeValidationModal.emit();

      } catch (error) {
        console.error('Error updating collection request:', error);
      }
    }
  }

  selectCollection(collection: CollectionRequest) {
    this.collectionRequest = collection;
    this.status = collection.status;
  }
}
