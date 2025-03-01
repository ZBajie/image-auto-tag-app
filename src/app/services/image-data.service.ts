import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageDataService {
  private imgFile = new BehaviorSubject<File | null>(null);
  imgSrc$ = this.imgFile.asObservable();

  setImgFile(file: File) {
    this.imgFile.next(file);
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
