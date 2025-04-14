import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDFComponent } from './list-df.component';

describe('ListDFComponent', () => {
  let component: ListDFComponent;
  let fixture: ComponentFixture<ListDFComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListDFComponent]
    });
    fixture = TestBed.createComponent(ListDFComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});