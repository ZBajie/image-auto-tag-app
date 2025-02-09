import { Component } from '@angular/core';
import { ImageUploadComponent } from '../../components/image-upload/image-upload.component';
import { ImageViewComponent } from '../../components/image-view/image-view.component';
import { MetadataEditorComponent } from '../../components/metadata-editor/metadata-editor.component';

@Component({
  selector: 'app-image-auto-tag',
  imports: [ImageUploadComponent, ImageViewComponent, MetadataEditorComponent],
  templateUrl: './image-auto-tag.component.html',
  styleUrl: './image-auto-tag.component.scss',
})
export class ImageAutoTagComponent {}
