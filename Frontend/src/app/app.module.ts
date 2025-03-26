import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common'; // Ajouté pour les pipes
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // Importé ici une seule fois

// Importation des composants
import { ListTVAComponent } from './components/list-tva/list-tva.component';
import { TvaDetailComponent } from './components/tvadetail/tvadetail.component';
import { TvaFormComponent } from './components/tvaform/tvaform.component';
import { CompteListComponent } from './components/compte-list/compte-list.component';
import { CompteFormComponent } from './components/compte-form/compte-form.component';
import { EcritureListComponent } from './components/ecriture-list/ecriture-list.component';
import { EcritureFormComponent } from './components/ecriture-form/ecriture-form.component';
import { FournisseursComponent } from './components/fournisseurs/fournisseurs.component';
import { CommandesComponent } from './components/commandes/commandes.component';
import { ProduitsComponent } from './components/produits/produits.component';
import { ListDFComponent } from './components/list-df/list-df.component';
import { DFFormComponent } from './components/df-form/df-form.component';
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
    FournisseursComponent,
    ListDFComponent,
    DFFormComponent,
    CommandesComponent,
    ProduitsComponent
  ],
  imports: [
    BrowserModule,
    CommonModule, // Ajouté pour date, titlecase, etc.
    AppRoutingModule,
    FormsModule, // Ajouté pour ngModel
    ReactiveFormsModule,
    HttpClientModule // Importé ici une seule fois
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
