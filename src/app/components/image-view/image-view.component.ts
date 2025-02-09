import { Component } from '@angular/core';
import { ImageDataService } from '../../services/image-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-image-view',
  imports: [],
  templateUrl: './image-view.component.html',
  styleUrl: './image-view.component.scss',
})
export class ImageViewComponent {
  imgSrc$: string | null = null;
  private subscription: Subscription;

  constructor(private imageDataService: ImageDataService) {
    this.subscription = this.imageDataService.imgSrc$.subscribe((imgSrc) => {
      this.imgSrc$ = imgSrc;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
