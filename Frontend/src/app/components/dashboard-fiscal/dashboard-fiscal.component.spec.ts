import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFiscalComponent } from './dashboard-fiscal.component';

describe('DashboardFiscalComponent', () => {
  let component: DashboardFiscalComponent;
  let fixture: ComponentFixture<DashboardFiscalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardFiscalComponent]
    });
    fixture = TestBed.createComponent(DashboardFiscalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
