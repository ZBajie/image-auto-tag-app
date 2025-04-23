import { Component } from '@angular/core';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { ImageAppInfoModalComponent } from '../image-app-info-modal/image-app-info-modal.component';
import { ImageSizeComponent } from '../image-size/image-size.component';

@Component({
  selector: 'app-controlpanel',
  imports: [
    ImageUploadComponent,
    ImageAppInfoModalComponent,
    ImageSizeComponent,
  ],
  templateUrl: './controlpanel.component.html',
  styleUrl: './controlpanel.component.scss',
})
export class ControlpanelComponent {}
