import { Injectable } from '@angular/core';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

@Injectable({
  providedIn: 'root',
})
export class ImageMetadataXmpService {
  private parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
  });
  private builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '',
  });

  readXmpMetaData(imageData: string) {
    if (!imageData) {
      console.error('No image data provided.');
      return null;
    }

    let xmpStart = imageData.indexOf('<x:xmpmeta');
    let xmpEndTag = '</x:xmpmeta>';

    if (xmpStart === -1) {
      xmpStart = imageData.indexOf('<xmpmeta');
      xmpEndTag = '</xmpmeta>';
    }

    if (xmpStart === -1) {
      console.warn('No XMP metadata found in image.');
      return null;
    }

    const xmpEnd = imageData.indexOf(xmpEndTag) + xmpEndTag.length;
    if (xmpEnd === -1) {
      console.warn('Invalid XMP metadata format.');
      return null;
    }

    const xmpXml = imageData.slice(xmpStart, xmpEnd);
    return this.parseXmpXml(xmpXml);
  }

  private parseXmpXml(xmpXml: string): any {
    try {
      return this.parser.parse(xmpXml);
    } catch (error) {
      console.error('Error parsing XMP metadata:', error);
      return null;
    }
  }

  writeXmpMetadata(imageData: string, newXmpData: any): string {
    if (!imageData) {
      console.error('No image data available.');
      return imageData;
    }

    let xmpStart = imageData.indexOf('<x:xmpmeta');
    let xmpEnd = imageData.indexOf('</x:xmpmeta>') + '</x:xmpmeta>'.length;

    if (xmpStart === -1 || xmpEnd === -1) {
      xmpStart = imageData.indexOf('<xmpmeta');
      xmpEnd = imageData.indexOf('</xmpmeta>') + '</xmpmeta>'.length;
    }

    let newXmpXml = this.builder.build(newXmpData);

    newXmpXml = newXmpXml
      .replace('<x:xmpmeta', '<xmpmeta')
      .replace('</x:xmpmeta>', '</xmpmeta>');

    let updatedImageData: string;

    if (xmpStart !== -1) {
      updatedImageData =
        imageData.slice(0, xmpStart) + newXmpXml + imageData.slice(xmpEnd);
    } else {
      updatedImageData = newXmpXml + imageData;
    }

    return updatedImageData;
  }
}
