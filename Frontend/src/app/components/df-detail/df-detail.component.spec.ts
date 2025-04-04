import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DFDetailComponent } from './df-detail.component';

describe('DFDetailComponent', () => {
  let component: DFDetailComponent;
  let fixture: ComponentFixture<DFDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DFDetailComponent]
    });
    fixture = TestBed.createComponent(DFDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
