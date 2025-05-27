import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclarationFiscaleComponent } from './declaration-fiscale.component';

describe('DeclarationFiscaleComponent', () => {
  let component: DeclarationFiscaleComponent;
  let fixture: ComponentFixture<DeclarationFiscaleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeclarationFiscaleComponent]
    });
    fixture = TestBed.createComponent(DeclarationFiscaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
