import { Injectable } from '@angular/core';
import * as piexif from 'piexifjs';
@Injectable({
  providedIn: 'root',
})
export class ImageMetadataExifService {
  constructor() {}

  readExifMetaData(imageData: string) {
    try {
      if (!imageData.startsWith('data:image/jpeg;base64,')) {
        console.warn('Not a JPEG image. EXIF data may not be present.');
        return;
      }
      const exifData = piexif.load(imageData);
      return exifData;
    } catch (error) {
      console.error('Error reading metadata:', error);
      return null;
    }
  }
}
