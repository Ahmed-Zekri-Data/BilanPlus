import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommandesComponent } from './components/commandes/commandes.component';
import { FournisseursComponent } from './components/fournisseurs/fournisseurs.component';
import { ProduitsComponent } from './components/produits/produits.component';
import { ListTVAComponent } from './components/list-tva/list-tva.component';
import { TvaDetailComponent } from './components/tvadetail/tvadetail.component';
import { TvaFormComponent } from './components/tvaform/tvaform.component';


const routes: Routes = [
  { path: 'commandes', component: CommandesComponent },
  { path: 'fournisseurs', component: FournisseursComponent },
  { path: '', redirectTo: '/commandes', pathMatch: 'full' },
  { path: 'produits', component: ProduitsComponent },
  {path:'TVA', component:ListTVAComponent},
  {path: 'getTVA/:id', component:TvaDetailComponent},
  {path : 'updatetva/:id', component:TvaFormComponent},
  {path : 'addtva', component:TvaFormComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }