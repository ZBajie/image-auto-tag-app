import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageAppInfoModalComponent } from './image-app-info-modal.component';

describe('ImageAppInfoModalComponent', () => {
  let component: ImageAppInfoModalComponent;
  let fixture: ComponentFixture<ImageAppInfoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageAppInfoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageAppInfoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
