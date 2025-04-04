import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilisateurDetailsComponent } from './utilisateur-details.component';

describe('UtilisateurDetailsComponent', () => {
  let component: UtilisateurDetailsComponent;
  let fixture: ComponentFixture<UtilisateurDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UtilisateurDetailsComponent]
    });
    fixture = TestBed.createComponent(UtilisateurDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
