import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionComptableComponent } from './gestion-comptable.component';

describe('GestionComptableComponent', () => {
  let component: GestionComptableComponent;
  let fixture: ComponentFixture<GestionComptableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GestionComptableComponent]
    });
    fixture = TestBed.createComponent(GestionComptableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
