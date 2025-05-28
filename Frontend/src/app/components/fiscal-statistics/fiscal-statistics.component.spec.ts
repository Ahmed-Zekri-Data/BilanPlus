import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiscalStatisticsComponent } from './fiscal-statistics.component';

describe('FiscalStatisticsComponent', () => {
  let component: FiscalStatisticsComponent;
  let fixture: ComponentFixture<FiscalStatisticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FiscalStatisticsComponent]
    });
    fixture = TestBed.createComponent(FiscalStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
