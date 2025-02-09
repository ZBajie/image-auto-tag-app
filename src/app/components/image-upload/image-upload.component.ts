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
    if (!file.type.match('image.*')) {
      this.fileName = 'Must be an image';
      return;
    }
    if (file.size > 4000000) {
      this.fileName = 'Max size is 4mb';
      return;
    }
    this.fileName = file.name;
    const imgUrl = URL.createObjectURL(file);
    this.imageService.setImgSrc(imgUrl);
  }
}
