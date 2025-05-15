import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DFTVAComponent } from './dftva.component';

describe('DFTVAComponent', () => {
  let component: DFTVAComponent;
  let fixture: ComponentFixture<DFTVAComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DFTVAComponent]
    });
    fixture = TestBed.createComponent(DFTVAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
