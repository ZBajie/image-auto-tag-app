import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
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
export class MetadataEditorComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private imageDataService = inject(ImageDataService);
  private imageMetadataExifService = inject(ImageMetadataExifService);
  private imageMetadataXmpService = inject(ImageMetadataXmpService);

  xmpForm!: FormGroup;
  imgFile: File | null = null;
  xmpDataXml: string | null = null;
  xmpDataJson: any = null;
  exifMetadata: any = {};

  ngOnInit() {
    this.imageDataService.imgSrc$.subscribe((file) => {
      if (file) {
        this.imgFile = file;
        this.extractMetadata();
      }
    });
    this.xmpForm = this.formBuilder.group({
      title: ['', Validators.required],
      creator: ['', Validators.required],
      description: ['', Validators.required],
      tags: this.formBuilder.array([]),
    });
  }

  getExifMetadata() {
    if (!this.imgFile) return;
    this.exifMetadata = this.imageMetadataExifService.readExifMetaData(
      this.imgFile
    );
  }

  async extractMetadata() {
    if (!this.imgFile) return;

    try {
      const metadataXml = await this.imageMetadataXmpService.readXmpMetaData(
        this.imgFile
      );
      if (!metadataXml) {
        console.warn('XMP metadata is undefined or missing.');
        return;
      }

      this.xmpDataXml = metadataXml;

      const parser = new XMLParser({ ignoreAttributes: false });
      this.xmpDataJson = parser.parse(metadataXml);

      this.initFormData();
    } catch (error) {
      console.error('Error extracting XMP:', error);
    }
  }

  initFormData() {
    if (!this.xmpDataJson || !this.xmpDataJson['x:xmpmeta']) {
      console.warn('XMP metadata is missing.');
      return;
    }

    const xmpDescription =
      this.xmpDataJson['x:xmpmeta']['rdf:RDF']['rdf:Description'];
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
      tagList.forEach((tag) => this.tags.push(this.formBuilder.control(tag)));
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
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
    });
    this.xmpDataJson = builder.build(updatedXmpData);
  }

  async saveMetadata() {
    await this.onUpdateXmpMetadata();
    await this.insertMetadata();
  }

  async insertMetadata() {
    const file = this.imgFile;
    if (!file) {
      alert('Please select an image first.');
      return;
    }

    try {
      const newBlob = await this.imageMetadataXmpService.writeXmpMetadata(
        file,
        this.xmpDataJson
      );
      const newFile = new File([newBlob], file.name, { type: file.type });
      this.imageDataService.setImgFile(newFile);

      alert('XMP metadata inserted successfully!');
    } catch (error) {
      console.error('Error inserting XMP:', error);
    }
  }
}
