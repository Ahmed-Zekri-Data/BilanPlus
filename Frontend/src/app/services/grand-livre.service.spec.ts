import { TestBed } from '@angular/core/testing';

import { GrandLivreService } from './grand-livre.service';

describe('GrandLivreService', () => {
  let service: GrandLivreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GrandLivreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
