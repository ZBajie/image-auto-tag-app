import { Component, inject } from '@angular/core';
import { ImageDataService } from '../../services/image-data.service';
import { ImageMetadataXmpService } from '../../services/image-metadata-xmp.service';
import { ImageMetadataExifService } from '../../services/image-metadata-exif.service';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
})
export class ImageUploadComponent {
  private imageDataService = inject(ImageDataService);
  private imageMetadataExifService = inject(ImageMetadataExifService);
  private imageMetadataXmpService = inject(ImageMetadataXmpService);

  fileName = '';
  selectedFile: File | null = null;
  extractedMetadata: string | null = null;

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

      this.fileName = file.name;
      this.selectedFile = file;

      this.extractedMetadata =
        await this.imageMetadataXmpService.readXmpMetaData(file);

      this.imageDataService.setImgFile(file);
    }
  }
}
