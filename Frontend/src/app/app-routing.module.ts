import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { UtilisateurComponent } from './components/utilisateur/utilisateur.component';
import { AddUtilisateurComponent } from './components/add-utilisateur/add-utilisateur.component';
import { UtilisateurDetailsComponent } from './components/utilisateur-details/utilisateur-details.component';


import { ProduitComponent } from './components/produit.component';

import { ListTVAComponent } from './components/list-tva/list-tva.component';
import { TvaDetailComponent } from './components/tvadetail/tvadetail.component';
import { TvaFormComponent } from './components/tvaform/tvaform.component';
import { DFFormComponent } from './components/df-form/df-form.component';
import { ListDFComponent } from './components/list-df/list-df.component';
import { DFDetailComponent } from './components/df-detail/df-detail.component';
import { ClientFormComponent } from './components/client-form/client-form.component';
import { ClientListComponent } from './components/client-list/client-list.component';
import { DevisFormComponent } from './devis-form/devis-form.component';
import { DevisListComponent } from './devis-list/devis-list.component';
import { FactureListComponent } from './facture-list/facture-list.component';
import { RelanceAutomationComponent } from './relance-automation/relance-automation.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReportingComponent } from './reporting/reporting.component';


const routes: Routes = [
  { path: '', redirectTo: '/produit', pathMatch: 'full' },
  { path: 'produit', component: ProduitComponent },
  {path:'TVA', component:ListTVAComponent},
  {path: 'getTVA/:id', component:TvaDetailComponent},
  {path : 'updatetva/:id', component:TvaFormComponent},
  {path : 'addtva', component:TvaFormComponent},
  {path : 'DF',component:ListDFComponent},
  {path : 'addDF',component:DFFormComponent},
  {path : 'UpdateDF/:id', component:DFFormComponent},

  { path: 'utilisateurs', component: UtilisateurComponent },
  { path: 'Addutilisateur', component: AddUtilisateurComponent },
  {path: 'utilisateur/details/:id', component: UtilisateurDetailsComponent},

  {path : 'getDF/:id', component:DFDetailComponent},
  // chaima
  {path : 'clientform', component:ClientFormComponent},
  {path : 'clientlist', component:ClientListComponent},
  {path : 'clientdevis', component:DevisFormComponent},
  {path : 'clientdevislist', component:DevisListComponent},
  {path : 'facturelist', component:FactureListComponent},
  {path : 'relance', component:RelanceAutomationComponent},
  {path : 'dashboard', component:DashboardComponent},
  {path : 'reporting', component:ReportingComponent},





  { path: '**', redirectTo: '/produit' }





];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }