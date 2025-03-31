import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListTVAComponent } from './components/list-tva/list-tva.component';
import { TvaDetailComponent } from './components/tvadetail/tvadetail.component';
import { TvaFormComponent } from './components/tvaform/tvaform.component';
import { DFFormComponent } from './components/df-form/df-form.component';
import { ListDFComponent } from './components/list-df/list-df.component';
import { DFDetailComponent } from './components/df-detail/df-detail.component';
import { CommandesComponent } from './components/commandes/commandes.component'; // Ajouté (ton travail)
import { FournisseursComponent } from './components/fournisseurs/fournisseurs.component'; // Ajouté (ton travail)
import { AddCommandeComponent } from './add-commande/add-commande.component'; // Ajouté (ton travail)
import { AddFournisseurComponent } from './add-fournisseur/add-fournisseur.component'; // Ajouté (ton travail)

const routes: Routes = [
  { path: 'TVA', component: ListTVAComponent },
  { path: 'getTVA/:id', component: TvaDetailComponent },
  { path: 'updatetva/:id', component: TvaFormComponent },
  { path: 'addtva', component: TvaFormComponent },
  { path: 'DF', component: ListDFComponent },
  { path: 'addDF', component: DFFormComponent },
  { path: 'UpdateDF/:id', component: DFFormComponent },
  { path: 'getDF/:id', component: DFDetailComponent },
  { path: 'commandes', component: CommandesComponent }, // Ajouté (ton travail)
  { path: 'add-commande', component: AddCommandeComponent }, // Ajouté (ton travail)
  { path: 'fournisseurs', component: FournisseursComponent }, // Ajouté (ton travail)
  { path: 'add-fournisseur', component: AddFournisseurComponent }, // Ajouté (ton travail)
  { path: '', redirectTo: '/TVA', pathMatch: 'full' } // Modifié pour respecter leur structure (pas de redirection vers /commandes par défaut)
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
