import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MSComponent } from './components/ms/ms.component';
import { ListTVAComponent } from './components/list-tva/list-tva.component';
import { ListDFComponent } from './components/list-df/list-df.component';
import { CompteListComponent } from './components/compte-list/compte-list.component';
import { EcritureListComponent } from './components/ecriture-list/ecriture-list.component';
import { ProduitComponent } from './components/produit.component';

const routes: Routes = [
  { path: '', redirectTo: '/produits', pathMatch: 'full' },
  { path: 'produits', component: ProduitComponent },
  { path: 'stock-movements', component: MSComponent },
  { path: 'tva', component: ListTVAComponent },
  { path: 'df', component: ListDFComponent },
  { path: 'comptes', component: CompteListComponent },
  { path: 'ecritures', component: EcritureListComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }