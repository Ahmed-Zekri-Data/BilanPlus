import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateTvaDialogComponent } from './generate-tva-dialog.component';

describe('GenerateTvaDialogComponent', () => {
  let component: GenerateTvaDialogComponent;
  let fixture: ComponentFixture<GenerateTvaDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerateTvaDialogComponent]
    });
    fixture = TestBed.createComponent(GenerateTvaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
