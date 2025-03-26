import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
<<<<<<< HEAD
import { ProduitComponent } from './components/produit.component';

const routes: Routes = [
  { path: '', redirectTo: '/produit', pathMatch: 'full' },
  { path: 'produit', component: ProduitComponent },
  { path: '**', redirectTo: '/produit' }
=======
import { ListTVAComponent } from './components/list-tva/list-tva.component';
import { TvaDetailComponent } from './components/tvadetail/tvadetail.component';
import { TvaFormComponent } from './components/tvaform/tvaform.component';
import { DFFormComponent } from './components/df-form/df-form.component';
import { ListDFComponent } from './components/list-df/list-df.component';


const routes: Routes = [
 {path:'TVA', component:ListTVAComponent},
  {path: 'getTVA/:id', component:TvaDetailComponent},
  {path : 'updatetva/:id', component:TvaFormComponent},
  {path : 'addtva', component:TvaFormComponent},
  {path : 'DF',component:ListDFComponent},
  {path : 'addDF',component:DFFormComponent},
  {path : 'UpdateDF/:id', component:DFFormComponent},

>>>>>>> origin
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }