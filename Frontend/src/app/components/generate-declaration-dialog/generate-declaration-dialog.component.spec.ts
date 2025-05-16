import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateDeclarationDialogComponent } from './generate-declaration-dialog.component';

describe('GenerateDeclarationDialogComponent', () => {
  let component: GenerateDeclarationDialogComponent;
  let fixture: ComponentFixture<GenerateDeclarationDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenerateDeclarationDialogComponent]
    });
    fixture = TestBed.createComponent(GenerateDeclarationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
