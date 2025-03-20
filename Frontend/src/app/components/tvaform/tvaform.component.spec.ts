import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvaformComponent } from './tvaform.component';

describe('TvaformComponent', () => {
  let component: TvaformComponent;
  let fixture: ComponentFixture<TvaformComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TvaformComponent]
    });
    fixture = TestBed.createComponent(TvaformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
