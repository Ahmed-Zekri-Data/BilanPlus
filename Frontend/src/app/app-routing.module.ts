import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListTVAComponent } from './components/list-tva/list-tva.component';
import { TvaDetailComponent } from './components/tvadetail/tvadetail.component';
import { TvaFormComponent } from './components/tvaform/tvaform.component';
import { DFFormComponent } from './components/df-form/df-form.component';
import { ListDFComponent } from './components/list-df/list-df.component';
import { DFDetailComponent } from './components/df-detail/df-detail.component';
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

const routes: Routes = [
  { path: 'TVA', component: ListTVAComponent },
  { path: 'getTVA/:id', component: TvaDetailComponent },
  { path: 'updatetva/:id', component: TvaFormComponent },
  { path: 'addtva', component: TvaFormComponent },
  { path: 'DF', component: ListDFComponent },
  { path: 'addDF', component: DFFormComponent },
  { path: 'UpdateDF/:id', component: DFFormComponent },
  { path: 'getDF/:id', component: DFDetailComponent },
  { path: 'commandes', component: CommandesComponent },
  { path: 'add-commande', component: AddCommandeComponent },
  { path: 'fournisseurs', component: FournisseursComponent },
  { path: 'add-fournisseur', component: AddFournisseurComponent },
  { path: 'produits', component: ProduitsComponent },
  { path: 'utilisateurs', component: UtilisateurComponent },
  { path: 'utilisateur/add', component: AddUtilisateurComponent },
  { path: 'utilisateur/edit/:id', component: AddUtilisateurComponent },
  { path: 'utilisateur/details/:id', component: UtilisateurDetailsComponent },
  { path: 'roles', component: RoleComponent },
  { path: 'role/add', component: AddRoleComponent },
  { path: 'role/edit/:id', component: AddRoleComponent },
  { path: 'role/details/:id', component: RoleDetailsComponent },
  { path: '', redirectTo: '/commandes', pathMatch: 'full' },
  { path: '**', redirectTo: '/produits' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }