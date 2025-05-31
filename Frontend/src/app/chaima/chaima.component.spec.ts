import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChaimaComponent } from './chaima.component';

describe('ChaimaComponent', () => {
  let component: ChaimaComponent;
  let fixture: ComponentFixture<ChaimaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChaimaComponent]
    });
    fixture = TestBed.createComponent(ChaimaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
