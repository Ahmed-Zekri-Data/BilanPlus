import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgChartsModule } from 'ng2-charts';// Correct import

// ... rest of the module code remains the same
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

// Components
import { HomeComponent } from './home/home.component';
import { ListTVAComponent } from './components/list-tva/list-tva.component';
import { TvaDetailComponent } from './components/tvadetail/tvadetail.component';
import { TvaFormComponent } from './components/tvaform/tvaform.component';
import { ProduitComponent } from './components/produit.component';
import { CompteListComponent } from './components/compte-list/compte-list.component';
import { CompteFormComponent } from './components/compte-form/compte-form.component';
import { EcritureListComponent } from './components/ecriture-list/ecriture-list.component';
import { EcritureFormComponent } from './components/ecriture-form/ecriture-form.component';
import { GestionComptableComponent } from './components/gestion-comptable/gestion-comptable.component';
import { FournisseursComponent } from './components/fournisseurs/fournisseurs.component';
import { CommandesComponent } from './components/commandes/commandes.component';
import { ListDFComponent } from './components/list-df/list-df.component';
import { DFFormComponent } from './components/df-form/df-form.component';
import { MSComponent } from './components/ms/ms.component';
import { UtilisateurComponent } from './components/utilisateur/utilisateur.component';
import { AddUtilisateurComponent } from './components/add-utilisateur/add-utilisateur.component';
import { UtilisateurDetailsComponent } from './components/utilisateur-details/utilisateur-details.component';
import { RoleDetailsComponent } from './components/role-details/role-details.component';
import { AddRoleComponent } from './components/add-role/add-role.component';
import { RoleComponent } from './components/role/role.component';
import { DFDetailComponent } from './components/df-detail/df-detail.component';
import { ShortenIdPipe } from './components/ms/shorten-id.pipe';
import { DashboardComponent } from './dashboard/dashboard.component';

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
    FournisseursComponent,
    CommandesComponent,
    ListDFComponent,
    DFFormComponent,
    MSComponent,
    UtilisateurComponent,
    AddUtilisateurComponent,
    UtilisateurDetailsComponent,
    RoleDetailsComponent,
    AddRoleComponent,
    RoleComponent,
    DFDetailComponent,
    ShortenIdPipe,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgChartsModule ,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule, // Added for mat-nav-list and mat-list-item
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }