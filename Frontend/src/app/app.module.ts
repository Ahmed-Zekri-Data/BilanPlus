import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProduitComponent } from './components/produit.component';
import { CommonModule } from '@angular/common'; // Ajouté pour les pipes
import { CompteListComponent } from './components/compte-list/compte-list.component';
import { CompteFormComponent } from './components/compte-form/compte-form.component';
import { EcritureListComponent } from './components/ecriture-list/ecriture-list.component';
import { EcritureFormComponent } from './components/ecriture-form/ecriture-form.component';

import { UtilisateurComponent } from './components/utilisateur/utilisateur.component';
import { AddUtilisateurComponent } from './components/add-utilisateur/add-utilisateur.component';
import { UtilisateurDetailsComponent } from './components/utilisateur-details/utilisateur-details.component';

import { ListTVAComponent } from './components/list-tva/list-tva.component';
import { TvaDetailComponent } from './components/tvadetail/tvadetail.component';
import { TvaFormComponent } from './components/tvaform/tvaform.component';
import { ListDFComponent } from './components/list-df/list-df.component';
import { DFFormComponent } from './components/df-form/df-form.component';
import { DFDetailComponent } from './components/df-detail/df-detail.component';



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

    UtilisateurComponent,
    AddUtilisateurComponent,
    UtilisateurDetailsComponent,




    ListDFComponent,

    DFFormComponent

    DFFormComponent,
    DFDetailComponent

    ProduitComponent

  ],
  imports: [
    BrowserModule,
    CommonModule, // Ajouté pour date, titlecase, etc.
    AppRoutingModule,
    FormsModule, // Ajouté pour ngModel
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }