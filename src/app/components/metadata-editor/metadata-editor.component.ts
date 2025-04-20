import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XMLParser } from 'fast-xml-parser';
import { ImageDataService } from '../../services/image-data.service';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { TensorflowService } from '../../services/tensorflow.service';

@Component({
  standalone: true,
  selector: 'app-metadata-editor',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './metadata-editor.component.html',
  styleUrl: './metadata-editor.component.scss',
})
export class MetadataEditorComponent implements OnInit {
  public formSaved = true;
  private formBuilder = inject(FormBuilder);
  private imageDataService = inject(ImageDataService);
  private tensorFlowService = inject(TensorflowService);

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
      creator: [''],
      description: [''],
      tags: this.formBuilder.array([]),
    });
    this.xmpForm.valueChanges.subscribe(() => {
      this.imageDataService.setMetadataFormSaved(false);
      this.formSaved = false;
    });
  }

  async extractMetadata() {
    if (!this.imgFile) return;

    this.imageDataService.xmpOriginal$.subscribe((xml) => {
      if (!xml) return;

      this.xmpDataXml = xml;
      const parser = new XMLParser({ ignoreAttributes: false });
      this.xmpDataJson = parser.parse(xml);

      this.initFormData();
    });
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

    const getLocalizedValue = (val: any) => {
      if (typeof val === 'string') return val;
      if (Array.isArray(val)) {
        const defaultItem = val.find(
          (item) => item?.['@_xml:lang'] === 'x-default'
        );
        return defaultItem?.['#text'] || '';
      }
      if (typeof val === 'object') {
        return val['#text'] || '';
      }
      return '';
    };

    this.xmpForm.patchValue({
      title: getLocalizedValue(
        xmpDescription['dc:title']?.['rdf:Alt']?.['rdf:li']
      ),
      description: getLocalizedValue(
        xmpDescription['dc:description']?.['rdf:Alt']?.['rdf:li']
      ),
      creator: getLocalizedValue(
        xmpDescription['dc:creator']?.['rdf:Seq']?.['rdf:li']
      ),
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

  async autoTagImage() {
    if (!this.imgFile) return;
    const tags = await this.tensorFlowService.getTensorflowMobilenetTags(
      this.imgFile
    );
    const existingTags = this.tags.controls.map((item) =>
      item.value.toLowerCase()
    );
    tags.forEach((tag) => {
      if (!existingTags.includes(tag.toLowerCase())) {
        this.tags.push(this.formBuilder.control(tag));
      }
    });
  }

  saveMetadata() {
    if (this.xmpForm.invalid) {
      this.xmpForm.markAllAsTouched();
      return;
    }
    const metadata = {
      title: this.xmpForm.value.title || 'Untitled',
      description: this.xmpForm.value.description || '',
      tags: this.tags.controls
        .map((tagControl) => tagControl.value)
        .filter((tag: string) => tag.trim() !== ''),

      creator: this.xmpForm.value.creator || '',
      generatedAt: new Date().toISOString(),
    };
    this.imageDataService.setMetaData(metadata);
    this.imageDataService.setMetadataFormSaved(true);
    this.formSaved = true;
  }
}
