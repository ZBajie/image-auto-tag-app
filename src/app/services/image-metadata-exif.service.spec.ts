import { TestBed } from '@angular/core/testing';

import { ImageMetadataExifService } from './image-metadata-exif.service';

describe('ImageMetadataExifService', () => {
  let service: ImageMetadataExifService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageMetadataExifService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
