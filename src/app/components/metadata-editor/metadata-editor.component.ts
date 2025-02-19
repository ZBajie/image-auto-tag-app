import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ImageDataService } from '../../services/image-data.service';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ImageMetadataExifService } from '../../services/image-metadata-exif.service';
import { ImageMetadataXmpService } from '../../services/image-metadata-xmp.service';

@Component({
  standalone: true,
  selector: 'app-metadata-editor',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './metadata-editor.component.html',
  styleUrl: './metadata-editor.component.scss',
})
export class MetadataEditorComponent implements OnInit, OnDestroy {
  private formBuilder = inject(FormBuilder);
  private imageDataService = inject(ImageDataService);
  private imageMetadataExifService = inject(ImageMetadataExifService);
  private imageMetadataXmpService = inject(ImageMetadataXmpService);

  imgSrcSubscription: Subscription | null = null;
  xmpForm!: FormGroup;
  imgFile: string | null = null;
  exifMetadata: any = {};
  xmpData: any = null;
  thumbnailData = null;

  constructor() {}

  ngOnInit() {
    this.xmpForm = this.formBuilder.group({
      title: ['', Validators.required],
      creator: ['', Validators.required],
      description: ['', Validators.required],
      tags: this.formBuilder.array([]),
    });

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
    this.exifMetadata = this.imageMetadataExifService.readExifMetaData(imgSrc);
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
    this.initFormData();
  }

  initFormData() {
    if (!this.xmpData || !this.xmpData['xmpmeta']) {
      console.warn('XMP metadata is undefined or missing.');
      return;
    }

    const xmpDescription =
      this.xmpData['xmpmeta']['rdf:RDF']['rdf:Description'];

    if (!xmpDescription) {
      console.warn('XMP description is missing.');
      return;
    }

    this.xmpForm.patchValue({
      title: xmpDescription['dc:title'] || '',
      creator: xmpDescription['dc:creator']?.['rdf:Seq']?.['rdf:li'] || '',
      description: xmpDescription['dc:description'] || '',
    });

    this.tags.clear();
    const tagList = xmpDescription['dc:subject']?.['rdf:Bag']?.['rdf:li'] || [];

    if (Array.isArray(tagList)) {
      tagList.forEach((tag) => {
        this.tags.push(this.formBuilder.control(tag));
      });
    } else if (typeof tagList === 'string' && tagList.trim() !== '') {
      this.tags.push(this.formBuilder.control(tagList));
    }
  }

  get tags(): FormArray {
    return this.xmpForm.get('tags') as FormArray;
  }

  addTag() {
    this.tags.push(this.formBuilder.control(''));
  }

  removeTag(index: number) {
    this.tags.removeAt(index);
  }

  onXmpFormSubmit() {
    console.log('XMP Form Data:', this.xmpForm.value);
  }

  async onUpdateXmpMetadata() {
    if (!this.imgFile) {
      return;
    }

    console.log(
      'tags:',
      this.tags.controls.map((tagControl) => tagControl.value)
    );

    const updatedXmpData = {
      'x:xmpmeta': {
        $: { 'xmlns:x': 'adobe:ns:meta/' },
        'rdf:RDF': {
          'rdf:Description': {
            $: { 'xmlns:dc': 'http://purl.org/dc/elements/1.1/' },
            'dc:title': this.xmpForm.value.title,
            'dc:creator': {
              'rdf:Seq': { 'rdf:li': this.xmpForm.value.creator },
            },
            'dc:description': this.xmpForm.value.description,
            'dc:subject': {
              'rdf:Bag': {
                'rdf:li': this.tags.controls
                  .map((tagControl) => tagControl.value)
                  .filter((tag: string) => tag.trim() !== ''),
              },
            },
          },
        },
      },
    };

    try {
      this.imgFile = await this.imageMetadataXmpService.writeXmpMetadata(
        this.imgFile,
        updatedXmpData
      );
      alert('XMP Metadata Updated!');
    } catch (error) {
      console.error('Error updating XMP metadata:', error);
    }
  }

  saveMetadata() {
    alert('Metadata saved! (Update logic needed to modify EXIF data)');
  }
}
