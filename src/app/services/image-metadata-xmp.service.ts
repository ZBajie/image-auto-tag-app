import { inject, Injectable } from '@angular/core';
import { ImageDataService, ImageMetadata } from './image-data.service';
import { image } from '@tensorflow/tfjs';

@Injectable({
  providedIn: 'root',
})
export class ImageMetadataXmpService {
  private imageDataService = inject(ImageDataService);

  imgFile: File | null = null;
  metaData: ImageMetadata | null = null;

  constructor() {
    this.imageDataService.imgSrc$.subscribe((file) => {
      if (file) {
        this.imgFile = file;
      }
    });
    this.imageDataService.metaData$.subscribe((data) => {
      if (data) {
        this.metaData = data;
      }
    });
  }
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

  async writeXmpMetadata(imgFile: File | null): Promise<Blob> {
    console.log('run write xmp data');
    if (!this.imgFile || !this.metaData) {
      throw new Error('Image file or metadata not available.');
    }
    console.log('xmp service metadata', this.metaData);

    const imageFile = this.imgFile;

    const xmpXml = this.createXmpXml(); // generates real XMP XML

    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = () => {
        const arrayBuffer = fileReader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);

        const encoder = new TextEncoder();
        const xmpPayload = encoder.encode(xmpXml);

        // Add XMP standard header required in JPEG
        const xmpIdentifier = encoder.encode('http://ns.adobe.com/xap/1.0/\0');
        const xmpBinary = new Uint8Array(
          xmpIdentifier.length + xmpPayload.length
        );
        xmpBinary.set(xmpIdentifier, 0);
        xmpBinary.set(xmpPayload, xmpIdentifier.length);

        // Build APP1 marker
        const xmpHeader = new Uint8Array(4);
        xmpHeader[0] = 0xff;
        xmpHeader[1] = 0xe1; // APP1
        const totalLength = xmpBinary.length + 2;
        xmpHeader[2] = (totalLength >> 8) & 0xff;
        xmpHeader[3] = totalLength & 0xff;

        // Insert after SOI (FFD8)
        const insertIndex = 2;

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

  private createXmpXml(): string {
    if (!this.metaData) {
      throw new Error('Metadata not available.');
    }
    const md = this.metaData;

    const tagList = (md.tags || [])
      .map((tag) => `<rdf:li>${tag}</rdf:li>`)
      .join('');

    return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
      <x:xmpmeta xmlns:x="adobe:ns:meta/">
        <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
          <rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/">
            <dc:title>
              <rdf:Alt>
                <rdf:li xml:lang="x-default">${md.title}</rdf:li>
              </rdf:Alt>
            </dc:title>
            <dc:description>
              <rdf:Alt>
                <rdf:li xml:lang="x-default">${md.description}</rdf:li>
              </rdf:Alt>
            </dc:description>
            <dc:creator>
              <rdf:Seq>
                <rdf:li>${md.creator}</rdf:li>
              </rdf:Seq>
            </dc:creator>
            <dc:subject>
              <rdf:Bag>
                ${tagList}
              </rdf:Bag>
            </dc:subject>
          </rdf:Description>
        </rdf:RDF>
      </x:xmpmeta>
      <?xpacket end="w"?>`;
  }

  /* async writeXmpMetadata(): Promise<Blob> {
    if (!this.imgFile || !this.metaData) {
      throw new Error('Image file or metadata not available.');
    }

    const imageFile = this.imgFile;
    const xmpData = this.createXmpDataJson();

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
  } */

  /* private createXmpDataJson() {
    if (!this.metaData) {
      throw new Error('Metadata not available.');
    }

    return {
      'x:xmpmeta': {
        $: { 'xmlns:x': 'adobe:ns:meta/' },
        'rdf:RDF': {
          'rdf:Description': {
            $: { 'xmlns:dc': 'http://purl.org/dc/elements/1.1/' },
            'dc:title': this.metaData.title,
            'dc:creator': {
              'rdf:Seq': { 'rdf:li': this.metaData.creator },
            },
            'dc:description': this.metaData.description,
            'dc:subject': {
              'rdf:Bag': {
                'rdf:li': this.metaData.tags || [],
              },
            },
          },
        },
      },
    };
  } */
  /* async writeXmpMetadata(imageFile: File, xmpData: string): Promise<Blob> {
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
  } */
}
