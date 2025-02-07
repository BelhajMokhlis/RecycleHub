export interface WasteItem {
    type: 'plastique' | 'verre' | 'papier' | 'métal';
    estimatedWeight: number; 
}

export enum CollectionRequestStatus {
    Pending = 'pending',
    Accepted = 'accepted',
    Rejected = 'rejected',
    Completed = 'completed'
}

export interface CollectionRequest {
    wasteItems: WasteItem[];
    collectionAddress: string;
    preferredDateTime: {
        date: string; 
        timeSlot: string; 
    };
    additionalNotes?: string;

    photosUrl?: string[];

    status: CollectionRequestStatus;

    particulierId: string;


    
}

