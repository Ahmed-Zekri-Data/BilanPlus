import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeclarationFiscaleTVAService } from '../../services/declaration-fiscale-tva.service';
import { TVA } from '../../Models/TVA';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-list-tva',
  templateUrl: './list-tva.component.html',
  styleUrls: ['./list-tva.component.css']
})
export class ListTVAComponent implements OnInit, AfterViewInit {
  tvaList: TVA[] = [];
  displayedColumns: string[] = ['id', 'taux', 'montant', 'declaration', 'actions'];
  isLoading: boolean = true;
  dataSource = new MatTableDataSource<TVA>([]);
  errors: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTVAList();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadTVAList(): void {
    this.isLoading = true;
    this.declarationFiscaleTVAService.getAllTVA().subscribe({
      next: (tvaList) => {
        this.tvaList = tvaList;
        this.dataSource.data = this.tvaList; // Mettre à jour les données de dataSource
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
    this.router.navigate(['/tvadetail', id]);
  }

  editTVA(id: string): void {
    this.router.navigate(['/updatetva', id]);
  }

  deleteTVA(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette TVA ?')) {
      this.declarationFiscaleTVAService.deleteTVA(id).subscribe({
        next: () => {
          this.snackBar.open('TVA supprimée avec succès', 'Fermer', { duration: 3000 });
          this.loadTVAList();
        },
        error: (errors: string[]) => {
          this.snackBar.open(errors.join(', '), 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  addTVA(): void {
    this.router.navigate(['/addtva']);
  }
}