import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
<<<<<<< HEAD
import { CommonModule } from '@angular/common';
=======
import { CommonModule } from '@angular/common'; // Conservé de leur version
>>>>>>> b6d6b22e0023e10f3122aaffd592f7f57297fe1c
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CompteListComponent } from './components/compte-list/compte-list.component';
import { CompteFormComponent } from './components/compte-form/compte-form.component';
import { EcritureListComponent } from './components/ecriture-list/ecriture-list.component';
import { EcritureFormComponent } from './components/ecriture-form/ecriture-form.component';
import { ListTVAComponent } from './components/list-tva/list-tva.component';
import { TvaDetailComponent } from './components/tvadetail/tvadetail.component';
import { TvaFormComponent } from './components/tvaform/tvaform.component';
import { ListDFComponent } from './components/list-df/list-df.component';
import { DFFormComponent } from './components/df-form/df-form.component';
import { DFDetailComponent } from './components/df-detail/df-detail.component';
<<<<<<< HEAD
import { CommandesComponent } from './components/commandes/commandes.component';
import { FournisseursComponent } from './components/fournisseurs/fournisseurs.component';
import { AddCommandeComponent } from './add-commande/add-commande.component';
import { AddFournisseurComponent } from './add-fournisseur/add-fournisseur.component';
import { ProduitsComponent } from './components/produits/produits.component';
import { UtilisateurComponent } from './components/utilisateur/utilisateur.component';
import { AddUtilisateurComponent } from './components/add-utilisateur/add-utilisateur.component';
import { UtilisateurDetailsComponent } from './components/utilisateur-details/utilisateur-details.component';
import { RoleComponent } from './components/role/role.component';
import { AddRoleComponent } from './components/add-role/add-role.component';
import { RoleDetailsComponent } from './components/role-details/role-details.component';
=======
import { CommandesComponent } from './components/commandes/commandes.component'; // Ajouté (ton travail)
import { FournisseursComponent } from './components/fournisseurs/fournisseurs.component'; // Ajouté (ton travail)
import { AddCommandeComponent } from './add-commande/add-commande.component'; // Ajouté (ton travail)
import { AddFournisseurComponent } from './add-fournisseur/add-fournisseur.component'; // Ajouté (ton travail)
>>>>>>> b6d6b22e0023e10f3122aaffd592f7f57297fe1c

@NgModule({
  declarations: [
    AppComponent,
    ListTVAComponent,
    TvaDetailComponent,
    TvaFormComponent,
    CompteListComponent,
    CompteFormComponent,
    EcritureListComponent,
    EcritureFormComponent,
    ListDFComponent,
    DFFormComponent,
    DFDetailComponent,
<<<<<<< HEAD
    CommandesComponent,
    FournisseursComponent,
    AddCommandeComponent,
    AddFournisseurComponent,
    ProduitsComponent,
    UtilisateurComponent,
    AddUtilisateurComponent,
    UtilisateurDetailsComponent,
    RoleComponent,
    AddRoleComponent,
    RoleDetailsComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
=======
    CommandesComponent, // Ajouté (ton travail)
    FournisseursComponent, // Ajouté (ton travail)
    AddCommandeComponent, // Ajouté (ton travail)
    AddFournisseurComponent // Ajouté (ton travail)
  ],
  imports: [
    BrowserModule,
    CommonModule, // Conservé de leur version
>>>>>>> b6d6b22e0023e10f3122aaffd592f7f57297fe1c
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }