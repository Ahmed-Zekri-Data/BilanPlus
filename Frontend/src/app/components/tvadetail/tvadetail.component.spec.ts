import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvaDetailComponent } from './tvadetail.component';

describe('TvaDetailComponent', () => {
  let component: TvaDetailComponent;
  let fixture: ComponentFixture<TvaDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TvaDetailComponent]
    });
    fixture = TestBed.createComponent(TvaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
