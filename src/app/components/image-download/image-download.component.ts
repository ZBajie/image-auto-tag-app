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
  onDownloadSingleRezized() {
    this.imageDataService.downloadSingleResized();
  }
  onDownloadSingleRezizedXmp() {
    if (this.imageDataService.getMetadataFormSaved()) {
      this.imageDataService.downloadSingleResizedWithXmp();
    } else {
      alert('Please save metadata first.');
    }
  }
}
