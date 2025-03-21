import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcritureFormComponent } from './ecriture-form.component';

describe('EcritureFormComponent', () => {
  let component: EcritureFormComponent;
  let fixture: ComponentFixture<EcritureFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EcritureFormComponent]
    });
    fixture = TestBed.createComponent(EcritureFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
