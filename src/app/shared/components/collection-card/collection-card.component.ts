import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionRequest } from '../../../core/models/CollectionRequest.model';
import { User } from '../../../core/models/user.model';
import { CollectionService } from '../../../core/services/Collection/collection.service';

@Component({
  selector: 'app-collection-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collection-card.component.html',
  styleUrl: './collection-card.component.scss'
})
export class CollectionCardComponent {
  @Output() deleteRequestEvent = new EventEmitter<void>();
  @Input() collectionRequest!: CollectionRequest;
  @Input() user?: User;
  @Input() currentUser?: User;


  constructor(private collectionService: CollectionService) {
  }

  wasteIcons = {
   plastique: '🥤',
    verre: '🍾',
    papier: '📄 ',
    métal: '🥫'
  };
  onInit() {
    console.log(this.user);
  }
  

  get totale(): number {
    return this.collectionRequest.wasteItems.reduce((total, item) => total + item.estimatedWeight, 0);
  }

  deleteRequest(requestId: string | undefined): void {
    if (!requestId) {
      console.error('Request ID is undefined');
      return;
    }

    this.collectionService.deleteCollectionRequest(requestId).subscribe({
      next: () => {
        this.deleteRequestEvent.emit(); 
        console.log('Request deleted successfully');
      },
      error: (error: any) => {
        console.error('Error deleting request:', error);
      }
    });
  }
  }
