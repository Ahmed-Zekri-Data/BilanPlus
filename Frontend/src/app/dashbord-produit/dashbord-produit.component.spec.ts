import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashbordProduitComponent } from './dashbord-produit.component';

describe('DashbordProduitComponent', () => {
  let component: DashbordProduitComponent;
  let fixture: ComponentFixture<DashbordProduitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashbordProduitComponent]
    });
    fixture = TestBed.createComponent(DashbordProduitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
