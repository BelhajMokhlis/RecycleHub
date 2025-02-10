import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CollectionService } from '../../../../core/services/Collection/collection.service';
import { CollectionRequest, CollectionRequestStatus } from '../../../../core/models/CollectionRequest.model';
import { User, UserRole } from '../../../../core/models/user.model';
import { IndexedDBService } from '../../../../core/services/db/indexed-db.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  collectionRequests: CollectionRequest[] = [];
  users: User[] = [];
  currentUser?: User;
  isCollectionFormOpen = false;
  ville: string[] = [];
  canAddRequest = true;
  totalPendingWeight = 0;
  selectedCollectionRequest: CollectionRequest | undefined = undefined;
  showValidationModal = false;

  constructor(private collectionService: CollectionService,
    private indexedDBService: IndexedDBService,
    private route: ActivatedRoute,
  ) {}


  async ngOnInit() {
    if (this.route.snapshot.data['currentUser']) {
      this.currentUser = this.route.snapshot.data['currentUser'];
      if (this.currentUser?.id) {
        this.collectionRequests = await this.getCollectionRequestsForUser(this.currentUser.id);
      }
    }
    this.indexedDBService.getAll('users').then((users) => {
      this.users = users as User[];
    });
    this.route.data.subscribe((data) => {
      this.ville = data['ville'].results.map((city: any) => city.asciiname);
    });
    this.checkCanAddRequest();
  }



  getUserForRequest(particulierId: string): User | undefined {
    return this.users.find(user => user.id === particulierId);
  }

  async getCollectionRequestsForUser(particulierId: string): Promise<CollectionRequest[]> {
    if (!this.currentUser) {
      return [];
    }
    if (this.currentUser?.role === UserRole.Collecteur) {
      const requests = await this.indexedDBService.getAll<CollectionRequest>('collectionRequests');
      const filteredRequests = requests.filter((request: CollectionRequest) => request.ville === this.currentUser?.ville);
      return filteredRequests;
    } else {
      const requests = await this.indexedDBService.getAll<CollectionRequest>('collectionRequests');
      const filteredRequests = requests.filter((request: CollectionRequest) => request.particulierId === particulierId);
      return filteredRequests;
    }

  }

  openCollectionForm() {
    this.isCollectionFormOpen = true;
  }

  async closeCollectionForm() {
    this.collectionRequests = await this.getCollectionRequestsForUser(this.currentUser?.id || '');
    this.checkCanAddRequest();
    this.isCollectionFormOpen = false;
  }


  checkCanAddRequest() {
    const pendingRequests = this.collectionRequests.filter(request => request.status === CollectionRequestStatus.Pending);
    if (pendingRequests.length >= 3) {
        this.canAddRequest = false;
    }
    this.totalPendingWeight = pendingRequests.reduce((total, request) => total + request.wasteItems.reduce((sum, item) => sum + item.estimatedWeight, 0), 0);
    if (this.totalPendingWeight >= 10000) {
      this.canAddRequest = false;
    }
    else {
      this.canAddRequest = true;
    }
  }





  async onHomeDeleted() {
    this.collectionRequests = await this.getCollectionRequestsForUser(this.currentUser?.id || '');
    this.checkCanAddRequest();
  }

  onChequeRequest(collectionRequest: CollectionRequest): void {
    this.selectedCollectionRequest = collectionRequest;
    this.showValidationModal = true;
  }

  closeValidationModal(): void {
    this.showValidationModal = false;
    this.selectedCollectionRequest = undefined;
  }
}

