import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelanceAutomationComponent } from './relance-automation.component';

describe('RelanceAutomationComponent', () => {
  let component: RelanceAutomationComponent;
  let fixture: ComponentFixture<RelanceAutomationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RelanceAutomationComponent]
    });
    fixture = TestBed.createComponent(RelanceAutomationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
