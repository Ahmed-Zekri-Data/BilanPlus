import { TestBed } from '@angular/core/testing';

import { DeclarationFiscaleTVAService } from './declaration-fiscale-tva.service';

describe('DeclarationFiscaleTVAService', () => {
  let service: DeclarationFiscaleTVAService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeclarationFiscaleTVAService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
