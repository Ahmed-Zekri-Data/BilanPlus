import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TVAdetailComponent } from './tvadetail.component';

describe('TVAdetailComponent', () => {
  let component: TVAdetailComponent;
  let fixture: ComponentFixture<TVAdetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TVAdetailComponent]
    });
    fixture = TestBed.createComponent(TVAdetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
