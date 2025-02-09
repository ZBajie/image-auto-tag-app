import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageAutoTagComponent } from './image-auto-tag.component';

describe('ImageAutoTagComponent', () => {
  let component: ImageAutoTagComponent;
  let fixture: ComponentFixture<ImageAutoTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageAutoTagComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageAutoTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
