import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulateurFiscalComponent } from './simulateur-fiscal.component';

describe('SimulateurFiscalComponent', () => {
  let component: SimulateurFiscalComponent;
  let fixture: ComponentFixture<SimulateurFiscalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SimulateurFiscalComponent]
    });
    fixture = TestBed.createComponent(SimulateurFiscalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
