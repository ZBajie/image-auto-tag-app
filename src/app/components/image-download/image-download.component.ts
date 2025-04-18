import { Component, inject } from '@angular/core';
import { ImageDataService } from '../../services/image-data.service';

@Component({
  selector: 'app-image-download',
  imports: [],
  templateUrl: './image-download.component.html',
  styleUrl: './image-download.component.scss',
})
export class ImageDownloadComponent {
  public imgFile: File | null = null;
  private imageDataService = inject(ImageDataService);

  ngOnInit() {
    this.imageDataService.imgSrc$.subscribe((file) => {
      if (file) {
        this.imgFile = file;
      }
    });
  }
  onDownload() {
    this.imageDataService.downloadFile();
  }
  onDownloadZip() {
    this.imageDataService.downloadZipFile();
  }
  onDownloadSingleRezized(width: number = 400) {
    this.imageDataService.downloadSingleResized(width);
  }
  onDownloadSingleRezizedXmp(width: number = 400) {
    this.imageDataService.downloadSingleResizedWithXmp(width);
  }
}
