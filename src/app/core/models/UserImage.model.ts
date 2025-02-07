export interface UserImage {
    id: string;
    userId: string;
    data: string;  // base64 string of the image
    type: string;  // e.g. 'image/jpeg'
}
