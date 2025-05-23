import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitComponent } from './produit.component';
import { beforeEach, describe, it } from 'node:test';

describe('ProduitComponent', () => {
  let component: ProduitComponent;
  let fixture: ComponentFixture<ProduitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProduitComponent]
    });
    fixture = TestBed.createComponent(ProduitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
