import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardchaimaComponent } from './dashboardchaima.component';

describe('DashboardchaimaComponent', () => {
  let component: DashboardchaimaComponent;
  let fixture: ComponentFixture<DashboardchaimaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardchaimaComponent]
    });
    fixture = TestBed.createComponent(DashboardchaimaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
