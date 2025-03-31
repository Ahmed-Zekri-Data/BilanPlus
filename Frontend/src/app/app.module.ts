import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common'; // Conservé de leur version
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
import { CommandesComponent } from './components/commandes/commandes.component'; // Ajouté (ton travail)
import { FournisseursComponent } from './components/fournisseurs/fournisseurs.component'; // Ajouté (ton travail)
import { AddCommandeComponent } from './add-commande/add-commande.component'; // Ajouté (ton travail)
import { AddFournisseurComponent } from './add-fournisseur/add-fournisseur.component'; // Ajouté (ton travail)

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
    CommandesComponent, // Ajouté (ton travail)
    FournisseursComponent, // Ajouté (ton travail)
    AddCommandeComponent, // Ajouté (ton travail)
    AddFournisseurComponent // Ajouté (ton travail)
  ],
  imports: [
    BrowserModule,
    CommonModule, // Conservé de leur version
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }