import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { DeclarationFiscale } from '../../Models/DeclarationFiscale';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GenerateDeclarationDialogComponent } from '../generate-declaration-dialog/generate-declaration-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-list-df',
  templateUrl: './list-df.component.html',
  styleUrls: ['./list-df.component.css']
})
export class ListDFComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  declarations: any= [];
  dataSource = new MatTableDataSource(this.declarations);
  displayedColumns: string[] = ['periode', 'type','montantTotal', 'totalTVACollectee', 'totalTVADeductible', 'totalTVADue', 'statut', 'actions'];
  isLoading: boolean = true;
  errors: string[] = [];


  constructor(
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDeclarations();
  }
  ngAfterViewInit(): void {
    // Important : assigner paginator & sort ici
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    }

  loadDeclarations(): void {
    this.isLoading = true;
    this.declarationFiscaleTVAService.getDeclarations().subscribe({
      next: (declarations: any) => {
        this.declarations = declarations;
        this.dataSource.data = this.declarations;
        this.dataSource.sort = this.sort;
        
        this.isLoading = false;
      },
      error: (errors: string[]) => {
        this.errors = errors;
        this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  viewDetails(id: string): void {
    this.router.navigate(['/get-declaration', id]);
  }

  editDeclaration(id: string): void {
    this.router.navigate(['/edit-declaration', id]);
  }

  deleteDeclaration(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette déclaration ?')) {
      this.declarationFiscaleTVAService.deleteDeclaration(id).subscribe({
        next: () => {
          this.snackBar.open('Déclaration supprimée avec succès', 'Fermer', { duration: 3000 });
          this.loadDeclarations();
        },
        error: (errors: string[]) => {
          this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  addDeclaration(): void {
    const dialogRef = this.dialog.open(GenerateDeclarationDialogComponent, {
      width: '500px'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.declarationFiscaleTVAService.generateDeclaration(result).subscribe({
          next: (declaration) => {
            this.snackBar.open('Déclaration générée avec succès', 'Fermer', { duration: 3000 });
            this.loadDeclarations();
          },
          error: (errors: string[]) => {
            this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }
}