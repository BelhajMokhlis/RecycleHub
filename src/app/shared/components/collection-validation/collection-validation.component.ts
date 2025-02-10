import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectionRequest, CollectionRequestStatus } from '../../../core/models/CollectionRequest.model';
import { IndexedDBService } from '../../../core/services/db/indexed-db.service';

@Component({
  selector: 'app-collection-validation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collection-validation.component.html',
  styleUrl: './collection-validation.component.scss'
})
export class CollectionValidationComponent {
  status: CollectionRequestStatus = CollectionRequestStatus.Pending;
  @Input() collectionRequest?: CollectionRequest;
  // Make CollectionRequestStatus available in template
  protected CollectionRequestStatus = CollectionRequestStatus;

  constructor(private indexedDBService: IndexedDBService) {}

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
      } catch (error) {
        console.error('Error updating collection request:', error);
      }
    }
  }
}
