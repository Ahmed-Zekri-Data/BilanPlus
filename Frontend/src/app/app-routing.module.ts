import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GestionComptableComponent } from './components/gestion-comptable/gestion-comptable.component';
import { CompteListComponent } from './components/compte-list/compte-list.component';
import { EcritureListComponent } from './components/ecriture-list/ecriture-list.component';
import { JournalComponent } from './components/journal/journal.component';
import { GrandLivreComponent } from './components/grand-livre/grand-livre.component';
import { BalanceComponent } from './components/balance/balance.component';
import { BilanComponent } from './components/bilan/bilan.component';
import { ResultatComponent } from './components/resultat/resultat.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'gestion-comptable',
    component: GestionComptableComponent,
    children: [
      { path: 'comptes', component: CompteListComponent },
      { path: 'ecritures', component: EcritureListComponent },
      { path: 'journal', component: JournalComponent },
      { path: 'grand-livre', component: GrandLivreComponent },
      { path: 'balance', component: BalanceComponent },
      { path: 'bilan', component: BilanComponent },
      { path: 'resultat', component: ResultatComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: '', redirectTo: 'comptes', pathMatch: 'full' }, // Redirection par défaut vers la liste des comptes
    ],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
