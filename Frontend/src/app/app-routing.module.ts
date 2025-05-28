import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
<<<<<<< HEAD
<<<<<<< HEAD
=======
import { CommandesComponent } from './components/commandes/commandes.component';
import { FournisseursComponent } from './components/fournisseurs/fournisseurs.component';
import { ProduitsComponent } from './components/produits/produits.component';
import { UtilisateurComponent } from './components/utilisateur/utilisateur.component';
import { AddUtilisateurComponent } from './components/add-utilisateur/add-utilisateur.component';
import { UtilisateurDetailsComponent } from './components/utilisateur-details/utilisateur-details.component';
>>>>>>> Gestion_Des_Utilisateurs_Et_Accés
import { ListTVAComponent } from './components/list-tva/list-tva.component';
import { TvaDetailComponent } from './components/tvadetail/tvadetail.component';
import { TvaFormComponent } from './components/tvaform/tvaform.component';
import { DFFormComponent } from './components/df-form/df-form.component';
import { ListDFComponent } from './components/list-df/list-df.component';
<<<<<<< HEAD
=======

=======
import { SectionLayoutComponent } from './components/shared/layout/section-layout.component';
import { DevisComponent } from './components/devis/devis.component';
import { ListDevisComponent } from './components/devis/list-devis.component';

// Stock
import { MSComponent } from './components/ms/ms.component';
import { ProduitComponent } from './components/produit.component';

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
import { CashFlowComponent } from './components/cash-flow/cash-flow.component';
import { FinancialRatiosComponent } from './components/financial-ratios/financial-ratios.component';
import { ComparativeReportsComponent } from './components/comparative-reports/comparative-reports.component';
import { TestDebugComponent } from './components/test-debug/test-debug.component';
import { UtilisateurComponent } from './components/utilisateur/utilisateur.component';
import { AddUtilisateurComponent } from './components/add-utilisateur/add-utilisateur.component';
import { UtilisateurDetailsComponent } from './components/utilisateur-details/utilisateur-details.component';
>>>>>>> 1085e4df42fe53c9859801374a0a74c970f07b9b
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
<<<<<<< HEAD
>>>>>>> Gestion_Des_Utilisateurs_Et_Accés
=======
import { GenerateDeclarationDialogComponent } from './components/generate-declaration-dialog/generate-declaration-dialog.component';
import { DFTVAComponent } from './components/dftva/dftva.component';
>>>>>>> 1085e4df42fe53c9859801374a0a74c970f07b9b

// Client / Facturation
import { ClientFormComponent } from './components/client-form/client-form.component';
import { ClientListComponent } from './components/client-list/client-list.component';
import { DevisFormComponent } from './devis-form/devis-form.component';
import { DevisListComponent } from './devis-list/devis-list.component';
import { FactureListComponent } from './facture-list/facture-list.component';
import { RelanceAutomationComponent } from './relance-automation/relance-automation.component';
import { ReportingComponent } from './reporting/reporting.component';

// Fournisseurs et Commandes
import { ListCommandesComponent } from './components/commandes/list-commandes/list-commandes.component';
import { CommandeFormComponent } from './components/commandes/commande-form/commande-form.component';
import { CommandeViewComponent } from './components/commandes/commande-view/commande-view.component';
import { ListFournisseursComponent } from './components/fournisseurs/list-fournisseurs/list-fournisseurs.component';
import { FournisseurFormComponent } from './components/fournisseurs/fournisseur-form/fournisseur-form.component';
import { FournisseurViewComponent } from './components/fournisseurs/fournisseur-view/fournisseur-view.component';

const routes: Routes = [
<<<<<<< HEAD
<<<<<<< HEAD
 {path:'TVA', component:ListTVAComponent},
=======
  { path: 'commandes', component: CommandesComponent },
  { path: 'fournisseurs', component: FournisseursComponent },
 // { path: '', redirectTo: '/commandes', pathMatch: 'full' },
  { path: 'produits', component: ProduitsComponent },
  {path:'TVA', component:ListTVAComponent},
>>>>>>> Gestion_Des_Utilisateurs_Et_Accés
  {path: 'getTVA/:id', component:TvaDetailComponent},
  {path : 'updatetva/:id', component:TvaFormComponent},
  {path : 'addtva', component:TvaFormComponent},
  //{path: '**', redirectTo: '/produit' },
  {path : 'DF',component:ListDFComponent},
  {path : 'addDF',component:DFFormComponent},
  {path : 'UpdateDF/:id', component:DFFormComponent},
<<<<<<< HEAD
  {pa}
=======
=======
  { path: '', component: HomeComponent },

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
      { path: 'cash-flow', component: CashFlowComponent },
      { path: 'financial-ratios', component: FinancialRatiosComponent },
      { path: 'comparative-reports', component: ComparativeReportsComponent },
      { path: 'debug', component: TestDebugComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Stock
  { path: 'produit', component: ProduitComponent },
  { path: 'stock-movements', component: MSComponent },

  // Commandes
  {
    path: 'commandes',
    component: SectionLayoutComponent,
    children: [
      { path: '', component: ListCommandesComponent },
      { path: 'add', component: CommandeFormComponent },
      { path: 'edit/:id', component: CommandeFormComponent },
      { path: 'view/:id', component: CommandeViewComponent }
    ]
  },

  // Fournisseurs
  {
    path: 'fournisseurs',
    component: SectionLayoutComponent,
    children: [
      { path: '', component: ListFournisseursComponent },
      { path: 'add', component: FournisseurFormComponent },
      { path: 'edit/:id', component: FournisseurFormComponent },
      { path: 'view/:id', component: FournisseurViewComponent }
    ]
  },

  // Devis
  {
    path: 'devis',
    component: SectionLayoutComponent,
    children: [
      { path: ':commandeId/:fournisseurId', component: DevisComponent },
      { path: '', component: ListDevisComponent }
    ]
  },

  // Utilisateurs
>>>>>>> 1085e4df42fe53c9859801374a0a74c970f07b9b
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

<<<<<<< HEAD
>>>>>>> Gestion_Des_Utilisateurs_Et_Accés
=======
  // Déclarations fiscales
  { path: 'list-declarations', component: ListDFComponent },
  { path: 'add-declaration', component: DFFormComponent },
  { path: 'edit-declaration/:id', component: DFFormComponent },
  { path: 'get-declaration/:id', component: DFDetailComponent },
  { path: 'generer-df', component: GenerateDeclarationDialogComponent },
  { path: 'DFTVA', component: DFTVAComponent },
>>>>>>> 1085e4df42fe53c9859801374a0a74c970f07b9b

  // Clients / Factures
  { path: 'clientform', component: ClientFormComponent },
  { path: 'clientlist', component: ClientListComponent },
  { path: 'clientdevis', component: DevisFormComponent },
  { path: 'clientdevislist', component: DevisListComponent },
  { path: 'facturelist', component: FactureListComponent },
  { path: 'relance', component: RelanceAutomationComponent },
  { path: 'reporting', component: ReportingComponent },

  // Wildcard route for unmatched paths
  { path: '**', redirectTo: 'clientlist' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}