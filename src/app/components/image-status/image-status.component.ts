import { Component, inject } from '@angular/core';
import {
  ImageDataService,
  ImageMetadata,
} from '../../services/image-data.service';

@Component({
  selector: 'app-image-status',
  imports: [],
  templateUrl: './image-status.component.html',
  styleUrl: './image-status.component.scss',
})
export class ImageStatusComponent {
  private imageDataService = inject(ImageDataService);

  imgFile: File | null = null;
  metaData: ImageMetadata | null = null;

  ngOnInit() {
    this.imageDataService.imgSrc$.subscribe((file) => {
      if (file) {
        this.imgFile = file;
      }
    });
    this.imageDataService.metaData$.subscribe((data) => {
      if (data) {
        this.metaData = data;
      }
    });
  }
}
