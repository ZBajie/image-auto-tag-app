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

  onDownloadZip() {
    if (this.imageDataService.getMetadataFormSaved()) {
      this.imageDataService.downloadZipFile();
    } else {
      alert('Please save metadata first.');
    }
  }
  onDownloadSingleRezized(width: number = 400) {
    this.imageDataService.downloadSingleResized(width);
  }
  onDownloadSingleRezizedXmp(width: number = 400) {
    if (this.imageDataService.getMetadataFormSaved()) {
      this.imageDataService.downloadSingleResizedWithXmp(width);
    } else {
      alert('Please save metadata first.');
    }
  }
}
