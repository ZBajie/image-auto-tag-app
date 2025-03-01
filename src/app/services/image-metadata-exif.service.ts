import { Injectable } from '@angular/core';
import * as piexif from 'piexifjs';
@Injectable({
  providedIn: 'root',
})
export class ImageMetadataExifService {
  constructor() {}

  async readExifMetaData(imageData: File) {
    const imageData64 = await this.convertFileToBase64(imageData);
    try {
      if (!imageData64.startsWith('data:image/jpeg;base64,')) {
        console.warn('Not a JPEG image. EXIF data may not be present.');
        return;
      }
      const exifData = piexif.load(imageData64);
      return exifData;
    } catch (error) {
      console.error('Error reading metadata:', error);
      return null;
    }
  }

  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}
