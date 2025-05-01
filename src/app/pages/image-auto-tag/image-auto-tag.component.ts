import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageViewComponent } from '../../components/image-view/image-view.component';
import { MetadataEditorComponent } from '../../components/metadata-editor/metadata-editor.component';
import { ImageDataService } from '../../services/image-data.service';
import { ControlpanelComponent } from '../../components/controlpanel/controlpanel.component';

@Component({
  selector: 'app-image-auto-tag',
  imports: [
    CommonModule,
    ImageViewComponent,
    MetadataEditorComponent,
    ControlpanelComponent,
  ],
  templateUrl: './image-auto-tag.component.html',
  styleUrl: './image-auto-tag.component.scss',
})
export class ImageAutoTagComponent {
  private imageDataService = inject(ImageDataService);

  imageUrl: string | null = null;

  ngOnInit() {
    this.imageDataService.imageUrl$.subscribe((url) => {
      this.imageUrl = url;
    });
  }
}
