import { TestBed } from '@angular/core/testing';

import { EcritureComptableService } from './ecriture-comptable.service';

describe('EcritureComptableService', () => {
  let service: EcritureComptableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EcritureComptableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
