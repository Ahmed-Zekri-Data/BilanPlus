import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgChartsModule } from 'ng2-charts';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTreeModule } from '@angular/material/tree';

// Components
import { HomeComponent } from './components/home/home.component';
import { ListTVAComponent } from './components/list-tva/list-tva.component';
import { TvaDetailComponent } from './components/tvadetail/tvadetail.component';
import { TvaFormComponent } from './components/tvaform/tvaform.component';
import { ProduitComponent } from './components/produit.component';
import { CompteListComponent } from './components/compte-list/compte-list.component';
import { CompteFormComponent } from './components/compte-form/compte-form.component';
import { EcritureListComponent } from './components/ecriture-list/ecriture-list.component';
import { EcritureFormComponent } from './components/ecriture-form/ecriture-form.component';
import { GestionComptableComponent } from './components/gestion-comptable/gestion-comptable.component';
import { JournalComponent } from './components/journal/journal.component';
import { GrandLivreComponent } from './components/grand-livre/grand-livre.component';
import { BalanceComponent } from './components/balance/balance.component';
import { BilanComponent } from './components/bilan/bilan.component';
import { ResultatComponent } from './components/resultat/resultat.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ListCommandesComponent } from './components/commandes/list-commandes/list-commandes.component';
import { CommandeFormComponent } from './components/commandes/commande-form/commande-form.component';
import { CommandeViewComponent } from './components/commandes/commande-view/commande-view.component';
import { ListFournisseursComponent } from './components/fournisseurs/list-fournisseurs/list-fournisseurs.component';
import { FournisseurFormComponent } from './components/fournisseurs/fournisseur-form/fournisseur-form.component';
import { FournisseurViewComponent } from './components/fournisseurs/fournisseur-view/fournisseur-view.component';
import { ListDFComponent } from './components/list-df/list-df.component';
import { DFFormComponent } from './components/df-form/df-form.component';
import { DFDetailComponent } from './components/df-detail/df-detail.component';
import { MSComponent } from './components/ms/ms.component';
import { UtilisateurComponent } from './components/utilisateur/utilisateur.component';
import { AddUtilisateurComponent } from './components/add-utilisateur/add-utilisateur.component';
import { UtilisateurDetailsComponent } from './components/utilisateur-details/utilisateur-details.component';
import { RoleComponent } from './components/role/role.component';
import { AddRoleComponent } from './components/add-role/add-role.component';
import { RoleDetailsComponent } from './components/role-details/role-details.component';
import { GenerateDeclarationDialogComponent } from './components/generate-declaration-dialog/generate-declaration-dialog.component';
import { GenerateTvaDialogComponent } from './components/generate-tva-dialog/generate-tva-dialog.component';
import { DFTVAComponent } from './components/dftva/dftva.component';
import { TvaManagementComponent } from './components/tva-management/tva-management.component';
import { DfManagementComponent } from './components/df-management/df-management.component';
import { FiscalDashboardComponent } from './components/fiscal-dashboard/fiscal-dashboard.component';
import { SimulationFiscaleComponent } from './components/simulation-fiscale/simulation-fiscale.component';
import { FiscalStatisticsComponent } from './components/fiscal-statistics/fiscal-statistics.component';
import { ShortenIdPipe } from './components/ms/shorten-id.pipe';
import { StockDashboardComponent } from './dashboardproduit/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ListTVAComponent,
    TvaDetailComponent,
    TvaFormComponent,
    ProduitComponent,
    CompteListComponent,
    CompteFormComponent,
    EcritureListComponent,
    EcritureFormComponent,
    GestionComptableComponent,
    JournalComponent,
    GrandLivreComponent,
    BalanceComponent,
    BilanComponent,
    ResultatComponent,
    DashboardComponent,
    ListCommandesComponent,
    ListFournisseursComponent,
    FournisseurFormComponent,
    FournisseurViewComponent,
    CommandeFormComponent,
    CommandeViewComponent,
    ListDFComponent,
    DFFormComponent,
    DFDetailComponent,
    MSComponent,
    UtilisateurComponent,
    AddUtilisateurComponent,
    UtilisateurDetailsComponent,
    RoleComponent,
    AddRoleComponent,
    RoleDetailsComponent,
    GenerateDeclarationDialogComponent,
    GenerateTvaDialogComponent,
    DFTVAComponent,
    TvaManagementComponent,
    DfManagementComponent,
    FiscalDashboardComponent,
    SimulationFiscaleComponent,
    FiscalStatisticsComponent,
    ShortenIdPipe,
    StockDashboardComponent
  ],
  imports: [
    BrowserModule,
    MatOptionModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgChartsModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDividerModule,
    MatSortModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonToggleModule,
    MatRippleModule,
    MatStepperModule,
    MatTreeModule,
    MatTooltipModule,
    MatExpansionModule,
    CommonModule
  ],
  providers: [DecimalPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }