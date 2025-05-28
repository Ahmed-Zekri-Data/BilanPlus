import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisFormComponent } from './devis-form.component';

describe('DevisFormComponent', () => {
  let component: DevisFormComponent;
  let fixture: ComponentFixture<DevisFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DevisFormComponent]
    });
    fixture = TestBed.createComponent(DevisFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
