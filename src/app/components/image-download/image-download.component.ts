import { Component, inject } from '@angular/core';
import { ImageDataService } from '../../services/image-data.service';

@Component({
  selector: 'app-image-download',
  imports: [],
  templateUrl: './image-download.component.html',
  styleUrl: './image-download.component.scss',
})
export class ImageDownloadComponent {
  private imageDataService = inject(ImageDataService);
  onDownload() {
    this.imageDataService.downloadFile();
  }
}
