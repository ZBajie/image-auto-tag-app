import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExifShowComponent } from './exif-show.component';

describe('ExifShowComponent', () => {
  let component: ExifShowComponent;
  let fixture: ComponentFixture<ExifShowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExifShowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExifShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
