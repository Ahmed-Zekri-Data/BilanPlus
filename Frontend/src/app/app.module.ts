import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';

import { HomeComponent } from './home/home.component';
import { CompteListComponent } from './components/compte-list/compte-list.component';
import { CompteFormComponent } from './components/compte-form/compte-form.component';
import { EcritureListComponent } from './components/ecriture-list/ecriture-list.component';
import { EcritureFormComponent } from './components/ecriture-form/ecriture-form.component';
import { GestionComptableComponent } from './components/gestion-comptable/gestion-comptable.component';
import { JournalComponent } from './components/journal/journal.component';
import { GrandLivreComponent } from './components/grand-livre/grand-livre.component';
import { BalanceComponent } from './components/balance/balance.component';
import { BilanComponent } from './components/bilan/bilan.component';
import { ResultatComponent } from './components/resultat/resultat.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdvancedSearchComponent } from './components/shared/advanced-search/advanced-search.component';
import { CashFlowComponent } from './components/cash-flow/cash-flow.component';
import { FinancialRatiosComponent } from './components/financial-ratios/financial-ratios.component';
import { ComparativeReportsComponent } from './components/comparative-reports/comparative-reports.component';
import { TestDebugComponent } from './components/test-debug/test-debug.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CompteListComponent,
    CompteFormComponent,
    EcritureListComponent,
    EcritureFormComponent,
    GestionComptableComponent,
    JournalComponent,
    GrandLivreComponent,
    BalanceComponent,
    BilanComponent,
    ResultatComponent,
    DashboardComponent,
    AdvancedSearchComponent,
    CashFlowComponent,
    FinancialRatiosComponent,
    ComparativeReportsComponent,
    TestDebugComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
