import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageDataService } from '../../services/image-data.service';

@Component({
  selector: 'app-image-size',
  imports: [CommonModule, FormsModule],
  templateUrl: './image-size.component.html',
  styleUrl: './image-size.component.scss',
})
export class ImageSizeComponent {
  public imgFile: File | null = null;
  private imageDataService = inject(ImageDataService);
  public imageSize: number = 600;
  public imageSizeControl = false;
  public setSizeTouched: boolean = false;

  ngOnInit() {
    this.imageDataService.imgSrc$.subscribe((file) => {
      if (file) {
        this.imgFile = file;
      }
    });
  }

  onSetSize(size: number = 600) {
    if (size < 200 || size > 1800) {
      this.imageSizeControl = true;
      setTimeout(() => {
        this.imageSizeControl = false;
      }, 3000);
      return;
    }
    this.imageDataService.setResizedWidth(size);
    this.setSizeTouched = false;
    console.log('onclick', this.setSizeTouched);
  }
  onSetSizeChange() {
    console.log(this.setSizeTouched);
    this.setSizeTouched = true;
    console.log(this.setSizeTouched);
  }
}
