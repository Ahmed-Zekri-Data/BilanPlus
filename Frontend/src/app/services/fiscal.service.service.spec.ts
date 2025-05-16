import { TestBed } from '@angular/core/testing';

import { FiscalServiceService } from './fiscal.service.service';

describe('FiscalServiceService', () => {
  let service: FiscalServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FiscalServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
