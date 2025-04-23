import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import JSZip from 'jszip';
import { writeXmpMetadata } from '../utils/xmp-utils';
import { ExifDict } from 'piexifjs';

@Injectable({
  providedIn: 'root',
})
export class ImageDataService {
  private imgFile = new BehaviorSubject<File | null>(null);
  private imageUrl = new BehaviorSubject<string | null>(null);
  private xmpOriginal = new BehaviorSubject<string | null>(null);
  private exifOriginal = new BehaviorSubject<ExifDict | null>(null);
  private metaData = new BehaviorSubject<ImageMetadata | null>(null);
  private metadataFormSaved = new BehaviorSubject<boolean>(true);
  private resizedWidth = new BehaviorSubject<number>(600);

  imgSrc$ = this.imgFile.asObservable();
  imageUrl$ = this.imageUrl.asObservable();
  xmpOriginal$ = this.xmpOriginal.asObservable();
  exifOriginal$ = this.exifOriginal.asObservable();
  metaData$ = this.metaData.asObservable();
  metadataFormSaved$ = this.metadataFormSaved.asObservable();
  resizedWidth$ = this.resizedWidth.asObservable();

  setImgFile(file: File) {
    this.imgFile.next(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrl.next(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  setXmpOriginal(xmp: string) {
    this.xmpOriginal.next(xmp);
  }

  setExifOriginal(exif: ExifDict) {
    this.exifOriginal.next(exif);
  }

  setMetaData(data: ImageMetadata) {
    this.metaData.next(data);
  }

  setMetadataFormSaved(saved: boolean) {
    this.metadataFormSaved.next(saved);
  }

  setResizedWidth(width: number) {
    this.resizedWidth.next(width);
  }

  getMetadataFormSaved(): boolean {
    return this.metadataFormSaved.getValue();
  }

  async downloadZipFile() {
    const file = this.imgFile.getValue();
    const metadata = this.metaData.getValue();

    if (!file || !metadata) {
      alert('No image or metadata found.');
      return;
    }

    const img = await createImageBitmap(file);

    const originalFilename = file.name;
    const defaultTitle = originalFilename.split('.')[0];
    const safeTitle = metadata.title
      ? metadata.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]/g, '')
      : defaultTitle;

    const sizes = [400, 800, 1600];
    const zip = new JSZip();

    zip.file('metadata.json', JSON.stringify(metadata, null, 2));

    for (const width of sizes) {
      const canvas = document.createElement('canvas');
      const scale = width / img.width;
      canvas.width = width;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to Blob.'));
            }
          },
          'image/jpeg',
          0.85
        );
      });

      zip.file(`${safeTitle}-${width}.jpg`, blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(zipBlob);
    a.download = `${safeTitle}-images.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  async resizeImage(file: File, targetWidth: number): Promise<Blob> {
    const imgBitmap = await createImageBitmap(file);

    const scale = targetWidth / imgBitmap.width;
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = imgBitmap.height * scale;

    const ctx = canvas.getContext('2d');
    ctx!.drawImage(imgBitmap, 0, 0, canvas.width, canvas.height);

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to convert canvas to Blob.'));
        },
        'image/jpeg',
        0.85
      );
    });
  }

  async downloadSingleResized() {
    const width = this.resizedWidth.getValue();
    const file = this.imgFile.getValue();
    const metadata = this.metaData.getValue();

    if (!file) {
      alert('No image selected.');
      return;
    }

    const resizedBlob = await this.resizeImage(file, width);

    const originalFilename = file.name;
    const defaultTitle = originalFilename.split('.')[0];
    const safeTitle = metadata?.title
      ? metadata.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]/g, '')
      : defaultTitle;

    const fileName = `${safeTitle}-${width}.jpg`;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(resizedBlob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  async downloadSingleResizedWithXmp() {
    const width = this.resizedWidth.getValue();

    const file = this.imgFile.getValue();
    const metadata = this.metaData.getValue();

    if (!file || !metadata) {
      alert('No image or metadata found.');
      return;
    }

    const resizedBlob = await this.resizeImage(file, width);

    const resizedFile = new File([resizedBlob], file.name, {
      type: 'image/jpeg',
    });

    const blobWithXmp = await writeXmpMetadata(resizedFile, metadata);

    const originalFilename = file.name;
    const defaultTitle = originalFilename.split('.')[0];
    const safeTitle = metadata.title
      ? metadata.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]/g, '')
      : defaultTitle;

    const fileName = `${safeTitle}-${width}.jpg`;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blobWithXmp);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }
}

export interface ImageMetadata {
  title: string;
  description: string;
  tags: string[];
  creator: string;
  generatedAt: string;
}
