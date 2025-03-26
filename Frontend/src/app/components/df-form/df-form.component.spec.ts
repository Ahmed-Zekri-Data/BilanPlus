import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DFFormComponent } from './df-form.component';

describe('DFFormComponent', () => {
  let component: DFFormComponent;
  let fixture: ComponentFixture<DFFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DFFormComponent]
    });
    fixture = TestBed.createComponent(DFFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});