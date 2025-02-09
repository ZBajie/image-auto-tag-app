import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImageDataService } from '../../services/image-data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-image-view',
  imports: [CommonModule],
  templateUrl: './image-view.component.html',
  styleUrl: './image-view.component.scss',
})
export class ImageViewComponent {
  imgSrc$: Observable<string | null>;

  constructor(private imageDataService: ImageDataService) {
    this.imgSrc$ = this.imageDataService.imgSrc$;
  }
}
