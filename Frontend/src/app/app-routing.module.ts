import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListTVAComponent } from './components/list-tva/list-tva.component';
import { TvaDetailComponent } from './components/tvadetail/tvadetail.component';
import { TvaFormComponent } from './components/tvaform/tvaform.component';
import { DFFormComponent } from './components/df-form/df-form.component';
import { ListDFComponent } from './components/list-df/list-df.component';

const routes: Routes = [
  { path: '', redirectTo: '/list-declarations', pathMatch: 'full' },
  { path: 'list-tva', component: ListTVAComponent }, // Correction de l'URL
  { path: 'getTVA/:id', component: TvaDetailComponent },
  { path: 'edit-tva/:id', component: TvaFormComponent }, // Correction de l'URL (updatetva → edit-tva)
  { path: 'add-tva', component: TvaFormComponent }, // Correction de l'URL (addtva → add-tva)
  { path: 'list-declarations', component: ListDFComponent }, // Correction de l'URL (DF → list-declarations)
  { path: 'add-declaration', component: DFFormComponent }, // Correction de l'URL (addDF → add-declaration)
  { path: 'edit-declaration/:id', component: DFFormComponent }, // Correction de l'URL (UpdateDF → edit-declaration)
  { path: '**', redirectTo: '/list-declarations' } // Redirection pour les routes inconnues
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }