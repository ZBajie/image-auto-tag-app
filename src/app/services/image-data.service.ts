import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TensorflowService } from './tensorflow.service';

@Injectable({
  providedIn: 'root',
})
export class ImageDataService {
  private imgFile = new BehaviorSubject<File | null>(null);
  private tensorflowMobilenetTags = new BehaviorSubject<string[]>([]);

  imgSrc$ = this.imgFile.asObservable();
  tensorflowMobilenetTags$ = this.tensorflowMobilenetTags.asObservable();

  constructor(private tensorflowService: TensorflowService) {
    /* this.imgSrc$.subscribe((file) => {
      if (file) {
        console.log('📸 New Image Detected, Running Classification...');
        this.tensorflowService.getTensorflowMobilenetTags(file).then((tags) => {
          this.setTensorflowMobilenetTags(tags);
        });
      }
    }); */
  }
  setImgFile(file: File) {
    this.imgFile.next(file);
  }

  setTensorflowMobilenetTags(tags: string[]) {
    this.tensorflowMobilenetTags.next(tags);
  }

  downloadFile() {
    const url = URL.createObjectURL(this.imgFile.getValue()!);
    const fileName = this.imgFile.getValue()!.name;
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Cleanup
  }
}
