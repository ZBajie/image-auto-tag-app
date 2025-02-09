import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageDataService {
  private imgSrc = new BehaviorSubject<string | null>(null);

  imgSrc$ = this.imgSrc.asObservable();

  setImgSrc(imgSrc: string) {
    this.imgSrc.next(imgSrc);
  }
}
