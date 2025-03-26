import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProduitComponent } from './components/produit.component';

const routes: Routes = [
  { path: '', redirectTo: '/produit', pathMatch: 'full' },
  { path: 'produit', component: ProduitComponent },
  { path: '**', redirectTo: '/produit' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }