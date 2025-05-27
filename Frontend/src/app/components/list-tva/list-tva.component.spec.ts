import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTVAComponent } from './list-tva.component';

describe('ListTVAComponent', () => {
  let component: ListTVAComponent;
  let fixture: ComponentFixture<ListTVAComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListTVAComponent]
    });
    fixture = TestBed.createComponent(ListTVAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
