import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListTVAComponent } from './components/list-tva/list-tva.component';
import { TvaDetailComponent } from './components/tvadetail/tvadetail.component';
import { TvaFormComponent } from './components/tvaform/tvaform.component';
import { DFFormComponent } from './components/df-form/df-form.component';
import { ListDFComponent } from './components/list-df/list-df.component';
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

const routes: Routes = [
  { path: 'TVA', component: ListTVAComponent },
  { path: 'getTVA/:id', component: TvaDetailComponent },
  { path: 'updatetva/:id', component: TvaFormComponent },
  { path: 'addtva', component: TvaFormComponent },
  { path: 'DF', component: ListDFComponent },
  { path: 'addDF', component: DFFormComponent },
  { path: 'UpdateDF/:id', component: DFFormComponent },
  { path: 'getDF/:id', component: DFDetailComponent },
<<<<<<< HEAD
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
=======
  { path: 'commandes', component: CommandesComponent }, // Ajouté (ton travail)
  { path: 'add-commande', component: AddCommandeComponent }, // Ajouté (ton travail)
  { path: 'fournisseurs', component: FournisseursComponent }, // Ajouté (ton travail)
  { path: 'add-fournisseur', component: AddFournisseurComponent }, // Ajouté (ton travail)
  { path: '', redirectTo: '/TVA', pathMatch: 'full' } // Modifié pour respecter leur structure (pas de redirection vers /commandes par défaut)
>>>>>>> b6d6b22e0023e10f3122aaffd592f7f57297fe1c
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
