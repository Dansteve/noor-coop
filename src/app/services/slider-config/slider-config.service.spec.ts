import { TestBed } from '@angular/core/testing';

import { SliderConfigService } from './slider-config.service';

describe('SliderConfigService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SliderConfigService = TestBed.get(SliderConfigService);
    expect(service).toBeTruthy();
  });
});
