import { TestBed } from '@angular/core/testing';

import { StockManagementService } from './stock-movements.service';

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
