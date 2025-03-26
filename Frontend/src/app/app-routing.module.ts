import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UtilisateurComponent } from './components/utilisateur/utilisateur.component';
import { AddUtilisateurComponent } from './components/add-utilisateur/add-utilisateur.component';
import { UtilisateurDetailsComponent } from './components/utilisateur-details/utilisateur-details.component';


const routes: Routes = [
  { path: 'utilisateurs', component: UtilisateurComponent },
  { path: 'Addutilisateur', component: AddUtilisateurComponent },
  {path: 'utilisateur/details/:id', component: UtilisateurDetailsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }