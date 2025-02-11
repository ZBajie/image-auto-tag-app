import { TestBed } from '@angular/core/testing';

import { ImageMetadataXmpService } from './image-metadata-xmp.service';

describe('ImageMetadataXmpService', () => {
  let service: ImageMetadataXmpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageMetadataXmpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
