import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
<<<<<<< HEAD
=======
import { CommandesComponent } from './components/commandes/commandes.component';
import { FournisseursComponent } from './components/fournisseurs/fournisseurs.component';
import { ProduitsComponent } from './components/produits/produits.component';
import { UtilisateurComponent } from './components/utilisateur/utilisateur.component';
import { AddUtilisateurComponent } from './components/add-utilisateur/add-utilisateur.component';
import { UtilisateurDetailsComponent } from './components/utilisateur-details/utilisateur-details.component';
>>>>>>> Gestion_Des_Utilisateurs_Et_Accés
import { ListTVAComponent } from './components/list-tva/list-tva.component';
import { TvaDetailComponent } from './components/tvadetail/tvadetail.component';
import { TvaFormComponent } from './components/tvaform/tvaform.component';
import { DFFormComponent } from './components/df-form/df-form.component';
import { ListDFComponent } from './components/list-df/list-df.component';
<<<<<<< HEAD
=======

import { RoleComponent } from './components/role/role.component';
import { AddRoleComponent } from './components/add-role/add-role.component';
import { RoleDetailsComponent } from './components/role-details/role-details.component';

import { DFDetailComponent } from './components/df-detail/df-detail.component';
>>>>>>> Gestion_Des_Utilisateurs_Et_Accés



const routes: Routes = [
<<<<<<< HEAD
 {path:'TVA', component:ListTVAComponent},
=======
  { path: 'commandes', component: CommandesComponent },
  { path: 'fournisseurs', component: FournisseursComponent },
 // { path: '', redirectTo: '/commandes', pathMatch: 'full' },
  { path: 'produits', component: ProduitsComponent },
  {path:'TVA', component:ListTVAComponent},
>>>>>>> Gestion_Des_Utilisateurs_Et_Accés
  {path: 'getTVA/:id', component:TvaDetailComponent},
  {path : 'updatetva/:id', component:TvaFormComponent},
  {path : 'addtva', component:TvaFormComponent},
  //{path: '**', redirectTo: '/produit' },
  {path : 'DF',component:ListDFComponent},
  {path : 'addDF',component:DFFormComponent},
  {path : 'UpdateDF/:id', component:DFFormComponent},
<<<<<<< HEAD
  {pa}
=======
  { path: 'utilisateurs', component: UtilisateurComponent },
  { path: 'utilisateur/add', component: AddUtilisateurComponent },
  { path: 'utilisateur/edit/:id', component: AddUtilisateurComponent },
  { path: 'utilisateur/details/:id', component: UtilisateurDetailsComponent },
  { path: 'roles', component: RoleComponent },
  { path: 'role/add', component: AddRoleComponent }, 
  { path: 'role/edit/:id', component: AddRoleComponent }, 
  { path: 'role/details/:id', component: RoleDetailsComponent },
  {path : 'getDF/:id', component:DFDetailComponent}


>>>>>>> Gestion_Des_Utilisateurs_Et_Accés

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }