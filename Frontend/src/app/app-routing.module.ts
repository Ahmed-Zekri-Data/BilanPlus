import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Imports from Gestion_de_stock branch
import { MSComponent } from './components/ms/ms.component';
import { ProduitComponent } from './components/produit.component';

// Imports from main/feature branches
import { HomeComponent } from './home/home.component';
import { GestionComptableComponent } from './components/gestion-comptable/gestion-comptable.component';
import { CompteListComponent } from './components/compte-list/compte-list.component';
import { EcritureListComponent } from './components/ecriture-list/ecriture-list.component';
import { CommandesComponent } from './components/commandes/commandes.component';
import { FournisseursComponent } from './components/fournisseurs/fournisseurs.component';
//import { ProduitsComponent } from './components/produits/produits.component';
import { UtilisateurComponent } from './components/utilisateur/utilisateur.component';
import { AddUtilisateurComponent } from './components/add-utilisateur/add-utilisateur.component';
import { UtilisateurDetailsComponent } from './components/utilisateur-details/utilisateur-details.component';
import { ListTVAComponent } from './components/list-tva/list-tva.component';
import { ListDFComponent } from './components/list-df/list-df.component';
import { RoleComponent } from './components/role/role.component';
import { AddRoleComponent } from './components/add-role/add-role.component';
import { RoleDetailsComponent } from './components/role-details/role-details.component';
import { DFDetailComponent } from './components/df-detail/df-detail.component';
// Assuming these components exist based on the routes
import { TvaDetailComponent } from './components/tvadetail/tvadetail.component';
import { TvaFormComponent } from './components/tvaform/tvaform.component';
import { DFFormComponent } from './components/df-form/df-form.component';

const routes: Routes = [
  { path: '', component: HomeComponent }, // Using HomeComponent as default
  {
    path: 'gestion-comptable',
    component: GestionComptableComponent,
    children: [
      { path: 'comptes', component: CompteListComponent },
      { path: 'ecritures', component: EcritureListComponent },
      { path: '', redirectTo: 'comptes', pathMatch: 'full' }
    ]
  },
  //{ path: 'produits', component: ProduitsComponent }, // From main
  { path: 'produit', component: ProduitComponent },   // From Gestion_de_stock (renamed to avoid conflict)
  { path: 'stock-movements', component: MSComponent },
  { path: 'commandes', component: CommandesComponent },
  { path: 'fournisseurs', component: FournisseursComponent },
  { path: 'TVA', component: ListTVAComponent },
  { path: 'getTVA/:id', component: TvaDetailComponent },
  { path: 'updatetva/:id', component: TvaFormComponent },
  { path: 'addtva', component: TvaFormComponent },
  { path: 'DF', component: ListDFComponent },
  { path: 'addDF', component: DFFormComponent },
  { path: 'UpdateDF/:id', component: DFFormComponent },
  { path: 'getDF/:id', component: DFDetailComponent },
  { path: 'utilisateurs', component: UtilisateurComponent },
  { path: 'utilisateur/add', component: AddUtilisateurComponent },
  { path: 'utilisateur/edit/:id', component: AddUtilisateurComponent },
  { path: 'utilisateur/details/:id', component: UtilisateurDetailsComponent },
  { path: 'roles', component: RoleComponent },
  { path: 'role/add', component: AddRoleComponent },
  { path: 'role/edit/:id', component: AddRoleComponent },
  { path: 'role/details/:id', component: RoleDetailsComponent },
  { path: '**', redirectTo: '' } // Wildcard route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }