import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommandesComponent } from './commandes.component';
import { ApiService } from '../../services/api.service';
import { CommandeAchat } from '../../Models/CommandeAchat';
import { Produit } from '../../Models/Produit';
import { Fournisseur } from '../../Models/Fournisseur';
import { of } from 'rxjs';

describe('CommandesComponent', () => {
  let component: CommandesComponent;
  let fixture: ComponentFixture<CommandesComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockCommandes: CommandeAchat[] = [
    { _id: '1', produit: 'prod1', quantite: 10, prix: 100, fournisseurID: 'fourn1', statut: 'En cours' },
    { _id: '2', produit: 'prod2', quantite: 20, prix: 200, fournisseurID: 'fourn2', statut: 'Terminé' }
  ];
  const mockProduits: { [key: string]: Produit } = {
    'prod1': { _id: 'prod1', nom: 'Produit A' },
    'prod2': { _id: 'prod2', nom: 'Produit B' }
  };
  const mockFournisseurs: { [key: string]: Fournisseur } = {
    'fourn1': { _id: 'fourn1', nom: 'Fournisseur A', email: '', adresse: '', categorie: '' },
    'fourn2': { _id: 'fourn2', nom: 'Fournisseur B', email: '', adresse: '', categorie: '' }
  };

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['getCommandes', 'getProduit', 'getFournisseur', 'deleteCommande']);
    apiServiceSpy.getCommandes.and.returnValue(of(mockCommandes));
    apiServiceSpy.getProduit.and.callFake((id: string) => of(mockProduits[id]));
    apiServiceSpy.getFournisseur.and.callFake((id: string) => of(mockFournisseurs[id]));
    apiServiceSpy.deleteCommande.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      declarations: [CommandesComponent],
      providers: [{ provide: ApiService, useValue: apiServiceSpy }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommandesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load commandes and related data on init', fakeAsync(() => {
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    expect(component.commandes).toEqual(mockCommandes);
    expect(apiServiceSpy.getCommandes).toHaveBeenCalled();
    expect(component.produits['prod1']).toEqual(mockProduits['prod1']);
    expect(component.fournisseurs['fourn1']).toEqual(mockFournisseurs['fourn1']);
  }));

  it('should display commandes in the table', () => {
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2); // 2 commandes
    expect(rows[0].querySelector('td:nth-child(2)').textContent).toContain('Fournisseur A');
    expect(rows[0].querySelector('td:nth-child(3)').textContent).toContain('Produit A');
  });

  it('should show empty message when no commandes', () => {
    component.commandes = [];
    fixture.detectChanges();
    const emptyMessage = fixture.nativeElement.querySelector('td[colspan="7"]').textContent;
    expect(emptyMessage).toContain('Aucune commande disponible');
  });

  it('should delete a commande', fakeAsync(() => {
    component.deleteCommande('1');
    tick();
    fixture.detectChanges();
    expect(apiServiceSpy.deleteCommande).toHaveBeenCalledWith('1');
    expect(component.commandes.length).toBe(1);
    expect(component.commandes[0]._id).toBe('2');
  }));
});