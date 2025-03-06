import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageMetadataXmpService {
  async readXmpMetaData(imageFile: File): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        const binaryString = new TextDecoder().decode(uint8Array);

        const xmpStart = binaryString.indexOf('<x:xmpmeta');
        const xmpEnd = binaryString.indexOf('</x:xmpmeta>');

        if (xmpStart !== -1 && xmpEnd !== -1) {
          const extractedXmp = binaryString.substring(xmpStart, xmpEnd + 12);
          resolve(extractedXmp);
        } else {
          console.warn('No XMP metadata found in binary.');
          resolve(null);
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(imageFile);
    });
  }

  async writeXmpMetadata(imageFile: File, xmpData: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = () => {
        const arrayBuffer = fileReader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);

        const encoder = new TextEncoder();
        const xmpBinary = encoder.encode(xmpData);

        const xmpHeader = new Uint8Array([
          0xff,
          0xe1, // APP1 marker
          (xmpBinary.length + 2) >> 8,
          (xmpBinary.length + 2) & 0xff,
        ]);

        let insertIndex = 2;
        for (let i = 2; i < uint8Array.length - 1; i++) {
          if (uint8Array[i] === 0xff && uint8Array[i + 1] === 0xe1) {
            insertIndex = i + 2 + (uint8Array[i + 2] << 8) + uint8Array[i + 3];
            break;
          }
        }

        const newImageData = new Uint8Array(
          uint8Array.length + xmpHeader.length + xmpBinary.length
        );
        newImageData.set(uint8Array.subarray(0, insertIndex));
        newImageData.set(xmpHeader, insertIndex);
        newImageData.set(xmpBinary, insertIndex + xmpHeader.length);
        newImageData.set(
          uint8Array.subarray(insertIndex),
          insertIndex + xmpHeader.length + xmpBinary.length
        );
        resolve(new Blob([newImageData], { type: imageFile.type }));
      };

      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(imageFile);
    });
  }
}
