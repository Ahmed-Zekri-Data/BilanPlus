import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Stock
import { MSComponent } from './components/ms/ms.component';
import { ProduitComponent } from './components/produit.component';
import { ProduitsComponent } from './components/produits/produits.component';

// Main / Comptabilité / Utilisateurs / Rôles
import { HomeComponent } from './home/home.component';
import { GestionComptableComponent } from './components/gestion-comptable/gestion-comptable.component';
import { CompteListComponent } from './components/compte-list/compte-list.component';
import { EcritureListComponent } from './components/ecriture-list/ecriture-list.component';
import { JournalComponent } from './components/journal/journal.component';
import { GrandLivreComponent } from './components/grand-livre/grand-livre.component';
import { BalanceComponent } from './components/balance/balance.component';
import { BilanComponent } from './components/bilan/bilan.component';
import { ResultatComponent } from './components/resultat/resultat.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UtilisateurComponent } from './components/utilisateur/utilisateur.component';
import { AddUtilisateurComponent } from './components/add-utilisateur/add-utilisateur.component';
import { UtilisateurDetailsComponent } from './components/utilisateur-details/utilisateur-details.component';
import { RoleComponent } from './components/role/role.component';
import { AddRoleComponent } from './components/add-role/add-role.component';
import { RoleDetailsComponent } from './components/role-details/role-details.component';

// TVA / Déclarations fiscales
import { ListTVAComponent } from './components/list-tva/list-tva.component';
import { TvaDetailComponent } from './components/tvadetail/tvadetail.component';
import { TvaFormComponent } from './components/tvaform/tvaform.component';
import { ListDFComponent } from './components/list-df/list-df.component';
import { DFFormComponent } from './components/df-form/df-form.component';
import { DFDetailComponent } from './components/df-detail/df-detail.component';
import { GenerateDeclarationDialogComponent } from './components/generate-declaration-dialog/generate-declaration-dialog.component';
import { DFTVAComponent } from './components/dftva/dftva.component';

// Commandes & fournisseurs
import { CommandesComponent } from './components/commandes/commandes.component';
import { FournisseursComponent } from './components/fournisseurs/fournisseurs.component';

// Dashboard for stock (from Gestion_de_stock)
import { StockDashboardComponent } from './dashboardproduit/dashboard.component';

const routes: Routes = [
  { path: '', component: HomeComponent },

  // Dashboard (stock-specific)
  { path: 'dashboard', component: StockDashboardComponent },

  // Gestion comptable
  {
    path: 'gestion-comptable',
    component: GestionComptableComponent,
    children: [
      { path: 'comptes', component: CompteListComponent },
      { path: 'ecritures', component: EcritureListComponent },
      { path: 'journal', component: JournalComponent },
      { path: 'grand-livre', component: GrandLivreComponent },
      { path: 'balance', component: BalanceComponent },
      { path: 'bilan', component: BilanComponent },
      { path: 'resultat', component: ResultatComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: '', redirectTo: 'comptes', pathMatch: 'full' }
    ]
  },

  // Stock
  { path: 'produits', component: ProduitsComponent },
  { path: 'produit', component: ProduitComponent },
  { path: 'stock-movements', component: MSComponent },

  // Commandes & fournisseurs
  { path: 'commandes', component: CommandesComponent },
  { path: 'fournisseurs', component: FournisseursComponent },

  // Utilisateurs
  { path: 'utilisateurs', component: UtilisateurComponent },
  { path: 'utilisateur/add', component: AddUtilisateurComponent },
  { path: 'utilisateur/edit/:id', component: AddUtilisateurComponent },
  { path: 'utilisateur/details/:id', component: UtilisateurDetailsComponent },

  // Rôles
  { path: 'roles', component: RoleComponent },
  { path: 'role/add', component: AddRoleComponent },
  { path: 'role/edit/:id', component: AddRoleComponent },
  { path: 'role/details/:id', component: RoleDetailsComponent },

  // TVA
  { path: 'list-tva', component: ListTVAComponent },
  { path: 'get-tva/:id', component: TvaDetailComponent },
  { path: 'edit-tva/:id', component: TvaFormComponent },
  { path: 'add-tva', component: TvaFormComponent },

  // Déclarations fiscales
  { path: 'list-declarations', component: ListDFComponent },
  { path: 'add-declaration', component: DFFormComponent },
  { path: 'edit-declaration/:id', component: DFFormComponent },
  { path: 'get-declaration/:id', component: DFDetailComponent },
  { path: 'generer-df', component: GenerateDeclarationDialogComponent },
  { path: 'DFTVA', component: DFTVAComponent },

  // Wildcard route for unmatched paths
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}