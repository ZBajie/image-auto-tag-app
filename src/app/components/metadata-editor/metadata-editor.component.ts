import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { ImageDataService } from '../../services/image-data.service';
import * as piexif from 'piexifjs';

@Component({
  selector: 'app-metadata-editor',
  imports: [CommonModule],
  templateUrl: './metadata-editor.component.html',
  styleUrl: './metadata-editor.component.scss',
})
export class MetadataEditorComponent {
  imgFile: string | null = null;
  metadata: any = {};
  imgSrcSubscription: Subscription | null = null;

  constructor(private imageDataService: ImageDataService) {}

  ngOnInit() {
    this.imgSrcSubscription = this.imageDataService.imgSrc$.subscribe(
      (imgSrc) => {
        if (imgSrc) {
          console.log('Received imgSrc:', imgSrc);
          this.imgFile = imgSrc;
          this.readMetaData(imgSrc);
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.imgSrcSubscription) {
      this.imgSrcSubscription.unsubscribe();
    }
  }

  readMetaData(imageDataUrl: string) {
    try {
      console.log('Reading metadata from:', imageDataUrl);

      if (!imageDataUrl.startsWith('data:image/jpeg;base64,')) {
        console.warn('Not a JPEG image. EXIF data may not be present.');
        return;
      }
      this.metadata = piexif.load(imageDataUrl);
      console.log('Extracted metadata:', this.metadata);
    } catch (error) {
      console.error('Error reading metadata:', error);
    }
  }
}
