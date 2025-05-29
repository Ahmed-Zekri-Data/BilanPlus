import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvaFormComponent } from './tvaform.component';

describe('TvaFormComponent', () => {
  let component: TvaFormComponent;
  let fixture: ComponentFixture<TvaFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TvaFormComponent]
    });
    fixture = TestBed.createComponent(TvaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
