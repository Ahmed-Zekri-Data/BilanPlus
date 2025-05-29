import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Layout
import { SectionLayoutComponent } from './components/shared/layout/section-layout.component';

// Main / Comptabilité
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

// Stock
import { MSComponent } from './components/ms/ms.component';
import { ProduitComponent } from './components/produit.component';

// Utilisateurs / Rôles
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

// Devis
import { DevisComponent } from './components/devis/devis.component';
import { ListDevisComponent } from './components/devis/list-devis.component';

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
import { AuthGuard } from './guards/auth.guards'; // Assuming AuthGuard is needed from HEAD version
import { LoginComponent } from './components/login/login.component'; // Assuming LoginComponent is needed
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component'; // Assuming ForgotPasswordComponent is needed
import { ResetPasswordComponent } from './components/reset-password/reset-password.component'; // Assuming ResetPasswordComponent is needed
import { UtilisateurDashboardComponent } from './components/utilisateur-dashboard/utilisateur-dashboard.component'; // Assuming UtilisateurDashboardComponent is needed
import { UtilisateurActivityComponent } from './components/utilisateur-activity/utilisateur-activity.component'; // Assuming UtilisateurActivityComponent is needed


const routes: Routes = [
  { path: '', component: HomeComponent }, // Default route from Main
  { path: 'login', component: LoginComponent }, // From HEAD
  { path: 'forgot-password', component: ForgotPasswordComponent }, // From HEAD
  { path: 'reset-password', component: ResetPasswordComponent }, // From HEAD

  // Gestion comptable
  {
    path: 'gestion-comptable',
    component: GestionComptableComponent,
    canActivate: [AuthGuard], // Added AuthGuard based on HEAD's pattern
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
  { path: 'produit', component: ProduitComponent, canActivate: [AuthGuard] },
  { path: 'stock-movements', component: MSComponent, canActivate: [AuthGuard] },
  { path: 'stocks', component: HomeComponent, canActivate: [AuthGuard] }, // From HEAD, assuming 'stocks' maps to a general view or MSComponent

  // Commandes
  {
    path: 'commandes',
    component: SectionLayoutComponent,
    canActivate: [AuthGuard],
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
    component: SectionLayoutComponent, // Main uses SectionLayoutComponent, HEAD uses HomeComponent
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ListFournisseursComponent },
      { path: 'add', component: FournisseurFormComponent },
      { path: 'edit/:id', component: FournisseurFormComponent },
      { path: 'view/:id', component: FournisseurViewComponent }
    ]
  },
   { path: 'facturation', component: HomeComponent, canActivate: [AuthGuard] }, // From HEAD

  // Devis
  {
    path: 'devis',
    component: SectionLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: ':commandeId/:fournisseurId', component: DevisComponent },
      { path: '', component: ListDevisComponent }
    ]
  },

  // Utilisateurs
  { path: 'utilisateurs', component: UtilisateurComponent, canActivate: [AuthGuard] }, // Combined from HEAD and Main
  { path: 'utilisateurs/liste', component: UtilisateurComponent, canActivate: [AuthGuard] }, // From HEAD
  { path: 'utilisateur/add', component: AddUtilisateurComponent, canActivate: [AuthGuard] },
  { path: 'utilisateur/edit/:id', component: AddUtilisateurComponent, canActivate: [AuthGuard] },
  { path: 'utilisateur/details/:id', component: UtilisateurDetailsComponent, canActivate: [AuthGuard] },
  { path: 'utilisateur/activity/:id', component: UtilisateurActivityComponent, canActivate: [AuthGuard] }, // From HEAD
  { path: 'utilisateur/profile', component: UtilisateurDetailsComponent, canActivate: [AuthGuard] }, // From HEAD
  { path: 'utilisateurs/dashboard', component: UtilisateurDashboardComponent, canActivate: [AuthGuard] }, // From HEAD

  // Rôles
  { path: 'roles', component: RoleComponent, canActivate: [AuthGuard] },
  { path: 'roles/create', component: AddRoleComponent, canActivate: [AuthGuard] }, // From HEAD (renamed from role/add)
  { path: 'roles/edit/:id', component: AddRoleComponent, canActivate: [AuthGuard] }, // From HEAD (renamed from role/edit/:id)
  { path: 'roles/view/:id', component: RoleDetailsComponent, canActivate: [AuthGuard] }, // From HEAD (renamed from role/details/:id)


  // TVA
  { path: 'list-tva', component: ListTVAComponent, canActivate: [AuthGuard] },
  { path: 'get-tva/:id', component: TvaDetailComponent, canActivate: [AuthGuard] },
  { path: 'edit-tva/:id', component: TvaFormComponent, canActivate: [AuthGuard] },
  { path: 'add-tva', component: TvaFormComponent, canActivate: [AuthGuard] },

  // Déclarations fiscales
  { path: 'list-declarations', component: ListDFComponent, canActivate: [AuthGuard] },
  { path: 'add-declaration', component: DFFormComponent, canActivate: [AuthGuard] },
  { path: 'edit-declaration/:id', component: DFFormComponent, canActivate: [AuthGuard] },
  { path: 'get-declaration/:id', component: DFDetailComponent, canActivate: [AuthGuard] },
  { path: 'generer-df', component: GenerateDeclarationDialogComponent, canActivate: [AuthGuard] },
  { path: 'DFTVA', component: DFTVAComponent, canActivate: [AuthGuard] },
  { path: 'declarations', component: HomeComponent, canActivate: [AuthGuard] }, // From HEAD

  // Clients / Factures
  { path: 'clientform', component: ClientFormComponent, canActivate: [AuthGuard] },
  { path: 'clientlist', component: ClientListComponent, canActivate: [AuthGuard] },
  { path: 'clientdevis', component: DevisFormComponent, canActivate: [AuthGuard] },
  { path: 'clientdevislist', component: DevisListComponent, canActivate: [AuthGuard] },
  { path: 'facturelist', component: FactureListComponent, canActivate: [AuthGuard] },
  { path: 'relance', component: RelanceAutomationComponent, canActivate: [AuthGuard] },
  { path: 'reporting', component: ReportingComponent, canActivate: [AuthGuard] },

  // Wildcard route for unmatched paths
  { path: '**', redirectTo: 'clientlist' } // Main uses 'clientlist', HEAD uses '/home'
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}