import { Component, inject } from '@angular/core';
import { ImageDataService } from '../../services/image-data.service';
import { readXmpMetaData } from '../../utils/xmp-utils';
import { readExifMetaData } from '../../utils/exif-utils';
import { ExifDict } from 'piexifjs';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
})
export class ImageUploadComponent {
  private imageDataService = inject(ImageDataService);

  public fileName = '';
  public selectedFile: File | null = null;
  private extractedMetadataXmp: string | null = null;
  private extractedMetadataExif: ExifDict | null = null;

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.type.match('image.*')) {
        this.fileName = 'Must be an image';
        return;
      }

      if (file.size > 4000000) {
        this.fileName = 'Max size is 4MB';
        return;
      }
      this.imageDataService.setMetaData(null);
      this.imageDataService.setMetadataFormSaved(true);
      this.imageDataService.setResizedWidth(600);
      this.imageDataService.setXmpOriginal(null);
      this.imageDataService.setExifOriginal(null);

      this.fileName = file.name;
      this.selectedFile = file;

      this.extractedMetadataXmp = await readXmpMetaData(file);
      if (this.extractedMetadataXmp) {
        this.imageDataService.setXmpOriginal(this.extractedMetadataXmp);
      }

      this.extractedMetadataExif = await readExifMetaData(file);
      if (this.extractedMetadataExif) {
        this.imageDataService.setExifOriginal(this.extractedMetadataExif);
      }

      this.imageDataService.setImgFile(file);
    }
  }
}
