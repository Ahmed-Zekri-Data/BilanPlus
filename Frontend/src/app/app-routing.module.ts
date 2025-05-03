import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './components/login/login.component';
import { UtilisateurComponent } from './components/utilisateur/utilisateur.component';
import { AddUtilisateurComponent } from './components/add-utilisateur/add-utilisateur.component';
import { RoleComponent } from './components/role/role.component';
import { AddRoleComponent } from './components/add-role/add-role.component';
import { RoleDetailsComponent } from './components/role-details/role-details.component';
import { AuthGuard } from './guards/auth.guards';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
//import { CompteListComponent } from './components/compte-list/compte-list.component';
import { UtilisateurDetailsComponent } from './components/utilisateur-details/utilisateur-details.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'utilisateurs', component: UtilisateurComponent, canActivate: [AuthGuard] },
  { path: 'utilisateur/add', component: AddUtilisateurComponent, canActivate: [AuthGuard] },
  { path: 'utilisateur/edit/:id', component: AddUtilisateurComponent, canActivate: [AuthGuard] },
  { path: 'utilisateur/details/:id', component: UtilisateurDetailsComponent, canActivate: [AuthGuard] },
  { path: 'roles', component: RoleComponent, canActivate: [AuthGuard] },
  { path: 'roles/create', component: AddRoleComponent, canActivate: [AuthGuard] },
  { path: 'roles/edit/:id', component: AddRoleComponent, canActivate: [AuthGuard] },
  { path: 'roles/view/:id', component: RoleDetailsComponent, canActivate: [AuthGuard] },
  //{ path: 'comptes', component: CompteListComponent, canActivate: [AuthGuard] },
  { path: 'facturation', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'fournisseurs', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'stocks', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'gestion-comptable', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'declarations', component: HomeComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }