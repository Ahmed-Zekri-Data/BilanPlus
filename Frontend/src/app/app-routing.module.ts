import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommandesComponent } from './components/commandes/commandes.component';
import { FournisseursComponent } from './components/fournisseurs/fournisseurs.component';
import { ProduitsComponent } from './components/produits/produits.component';
import { UtilisateurComponent } from './components/utilisateur/utilisateur.component';
import { AddUtilisateurComponent } from './components/add-utilisateur/add-utilisateur.component';
import { UtilisateurDetailsComponent } from './components/utilisateur-details/utilisateur-details.component';
import { ListTVAComponent } from './components/list-tva/list-tva.component';
import { TvaDetailComponent } from './components/tvadetail/tvadetail.component';
import { TvaFormComponent } from './components/tvaform/tvaform.component';
import { DFFormComponent } from './components/df-form/df-form.component';
import { ListDFComponent } from './components/list-df/list-df.component';
import { DFDetailComponent } from './components/df-detail/df-detail.component';


const routes: Routes = [
  { path: 'commandes', component: CommandesComponent },
  { path: 'fournisseurs', component: FournisseursComponent },
  { path: '', redirectTo: '/commandes', pathMatch: 'full' },
  { path: 'produits', component: ProduitsComponent },
  {path:'TVA', component:ListTVAComponent},
  {path: 'getTVA/:id', component:TvaDetailComponent},
  {path : 'updatetva/:id', component:TvaFormComponent},
  {path : 'addtva', component:TvaFormComponent},
  {path: '**', redirectTo: '/produit' },
  {path : 'DF',component:ListDFComponent},
  {path : 'addDF',component:DFFormComponent},
  {path : 'UpdateDF/:id', component:DFFormComponent},
  { path: 'utilisateurs', component: UtilisateurComponent },
  { path: 'Addutilisateur', component: AddUtilisateurComponent },
  {path: 'utilisateur/details/:id', component: UtilisateurDetailsComponent}
  {path : 'getDF/:id', component:DFDetailComponent}



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }