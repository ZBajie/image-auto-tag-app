import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ImageDataService } from '../../services/image-data.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ImageMetadataExifService } from '../../services/image-metadata-exif.service';
import { ImageMetadataXmpService } from '../../services/image-metadata-xmp.service';

@Component({
  selector: 'app-metadata-editor',
  imports: [
    CommonModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './metadata-editor.component.html',
  styleUrl: './metadata-editor.component.scss',
})
export class MetadataEditorComponent {
  imgSrcSubscription: Subscription | null = null;

  imgFile: string | null = null;
  exifMetadata: any = {};
  xmpData: any = null;
  thumbnailData = null;

  newXmpData = {
    'x:xmpmeta': {
      $: { 'xmlns:x': 'adobe:ns:meta/' },
      'rdf:RDF': {
        'rdf:Description': {
          $: {
            'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
          },
          'dc:title': 'Updated Title',
          'dc:creator': { 'rdf:Seq': { 'rdf:li': 'Jane Doe' } },
          'dc:description': 'Updated description with debug check',
          'dc:subject': { 'rdf:Bag': { 'rdf:li': ['tagA', 'tagB', 'tagC'] } },
        },
      },
    },
  };

  constructor(
    private imageDataService: ImageDataService,
    private imageMetaExifService: ImageMetadataExifService,
    private imageMetadataXmpService: ImageMetadataXmpService
  ) {}

  ngOnInit() {
    this.imgSrcSubscription = this.imageDataService.imgSrc$.subscribe(
      async (imgSrc) => {
        if (imgSrc) {
          this.imgFile = imgSrc;
          this.getExifMetadata(this.imgFile);
          await this.getXmpMetadata();
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.imgSrcSubscription) {
      this.imgSrcSubscription.unsubscribe();
    }
  }

  getExifMetadata(imgSrc: string) {
    this.exifMetadata = this.imageMetaExifService.readExifMetaData(imgSrc);
  }

  async getXmpMetadata() {
    if (!this.imgFile) {
      return;
    }

    try {
      this.xmpData = await this.imageMetadataXmpService.readXmpMetaData(
        this.imgFile
      );

      if (!this.xmpData) {
        return;
      }
    } catch (error) {
      console.error('Error reading XMP metadata:', error);
    }
  }

  async onUpdateXmpMetadata() {
    if (!this.imgFile) {
      return;
    }

    try {
      this.imgFile = await this.imageMetadataXmpService.writeXmpMetadata(
        this.imgFile,
        this.newXmpData
      );
      alert('XMP Metadata Updated!');
    } catch (error) {
      console.error(' Error updating XMP metadata:', error);
    }
  }

  saveMetadata() {
    console.log('Updated Metadata:');
    alert('Metadata saved! (Update logic needed to modify EXIF data)');
  }
}
