import { TestBed } from '@angular/core/testing';

import { StockManagementService } from './gestion-de-stock.service';

describe('StockManagementService', () => {
  let service: StockManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
