import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AppComponent } from './app.component';
import { CompteListComponent } from './components/compte-list/compte-list.component';
import { EcritureListComponent } from './components/ecriture-list/ecriture-list.component';

const routes: Routes = [
  { path: '', component: HomeComponent }, // Page d'accueil
  { path: 'gestion-comptable', component: AppComponent }, // Ancienne page déplacée
  { path: 'comptes', component: CompteListComponent }, // Route pour la liste des comptes
  { path: 'ecritures', component: EcritureListComponent }, // Route pour la liste des écritures
  { path: 'utilisateurs', redirectTo: '' }, // À remplacer par le composant correspondant
  { path: 'facturation', redirectTo: '' }, // À remplacer par le composant correspondant
  { path: 'fournisseurs', redirectTo: '' }, // À remplacer par le composant correspondant
  { path: 'stocks', redirectTo: '' }, // À remplacer par le composant correspondant
  { path: 'declarations', redirectTo: '' }, // À remplacer par le composant correspondant
  { path: '**', redirectTo: '' } // Redirection par défaut
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }