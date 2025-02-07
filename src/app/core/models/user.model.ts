export enum UserRole {
    Collecteur = 'collecteur',
    Particulier = 'particulier'
}

export interface User {
    id: string;
    email: string;
    password: string;
    isActive: boolean;
    firstName: string;
    lastName: string;
    ville: string;
    phoneNumber: string;
    birthDate: Date;
    profilePhotoUrl?: string; // Optional field
    imageUrl?: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}
