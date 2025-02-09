import { Component } from '@angular/core';
import { ImageDataService } from '../../services/image-data.service';

@Component({
  selector: 'app-image-upload',
  imports: [],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
})
export class ImageUploadComponent {
  fileName = '';

  constructor(private imageService: ImageDataService) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const imgUrl = URL.createObjectURL(file);
    this.imageService.setImgSrc(imgUrl);
    this.fileName = file.name;
  }
}
