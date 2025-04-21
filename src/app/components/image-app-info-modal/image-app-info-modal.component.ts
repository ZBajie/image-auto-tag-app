import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-app-info-modal',
  imports: [CommonModule],
  templateUrl: './image-app-info-modal.component.html',
  styleUrl: './image-app-info-modal.component.scss',
})
export class ImageAppInfoModalComponent {
  public showModal = false;

  onShowModal() {
    this.showModal = !this.showModal;
  }
}
