import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MSComponent } from './ms.component';
import { beforeEach, describe, it } from 'node:test';

describe('MSComponent', () => {
  let component: MSComponent;
  let fixture: ComponentFixture<MSComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MSComponent]
    });
    fixture = TestBed.createComponent(MSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
