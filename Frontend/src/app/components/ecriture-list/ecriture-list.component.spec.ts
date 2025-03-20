import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcritureListComponent } from './ecriture-list.component';

describe('EcritureListComponent', () => {
  let component: EcritureListComponent;
  let fixture: ComponentFixture<EcritureListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EcritureListComponent]
    });
    fixture = TestBed.createComponent(EcritureListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
