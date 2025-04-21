import { Component, inject } from '@angular/core';
import { ImageDataService } from '../../services/image-data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exif-show',
  imports: [CommonModule],
  templateUrl: './exif-show.component.html',
  styleUrl: './exif-show.component.scss',
})
export class ExifShowComponent {
  private imageDataService = inject(ImageDataService);
  exifMetadata: any = {};

  ngOnInit() {
    this.imageDataService.exifOriginal$.subscribe((data) => {
      if (data) {
        this.exifMetadata = data;
      }
    });
  }
}
