import { TestBed } from '@angular/core/testing';

import { ImageMetadataIptcService } from './image-metadata-iptc.service';

describe('ImageMetadataIptcService', () => {
  let service: ImageMetadataIptcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageMetadataIptcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
