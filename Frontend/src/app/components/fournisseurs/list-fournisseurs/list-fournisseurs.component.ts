import { Component, OnInit, ViewChild } from '@angular/core';
import { FournisseurService } from '../../../services/fournisseur.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PdfService } from '../../../services/pdf.service';

@Component({
  selector: 'app-list-fournisseurs',
  templateUrl: './list-fournisseurs.component.html',
  styleUrls: ['./list-fournisseurs.component.css']
})
export class ListFournisseursComponent implements OnInit {
  fournisseurs: any[] = [];
  dataSource: MatTableDataSource<any>;
  isLoading = false;
  displayedColumns: string[] = ['id', 'nom', 'email', 'contact', 'statut', 'actions'];
  
  // Search and filter properties
  searchTerm: string = '';
  selectedCategorie: string = '';
  categories: string[] = ['categorie'];
  zoneGeo: string = '';
  
  // Pagination properties
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  totalItems: number = 0;
  pageSize: number = 5;
  currentPage: number = 0;

  constructor(
    private fournisseurService: FournisseurService,
    private snackBar: MatSnackBar,
    private router: Router,
    private pdfService: PdfService
  ) {
    this.dataSource = new MatTableDataSource<any>([]);
  }

  ngOnInit(): void {
    this.loadFournisseurs();
  }

  loadFournisseurs(): void {
    this.isLoading = true;
    const params = {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm,
      categorie: this.selectedCategorie,
      zoneGeo: this.zoneGeo
    };

    this.fournisseurService.getFournisseursWithFilters(params).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.fournisseurs = response;
          this.dataSource.data = this.fournisseurs;
          this.totalItems = this.fournisseurs.length;
        } else {
          this.fournisseurs = response.data;
          this.dataSource.data = this.fournisseurs;
          this.totalItems = response.total;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du chargement des fournisseurs', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  applyFilter(): void {
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadFournisseurs();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadFournisseurs();
  }

  exportToPDF(): void {
    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Liste des Fournisseurs', style: 'header' },
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*'],
            body: [
              ['ID', 'Nom', 'Email', 'Contact', 'Statut'],
              ...this.fournisseurs.map(fournisseur => [
                fournisseur._id || '',
                fournisseur.nom || '',
                fournisseur.email || '',
                fournisseur.contact || '',
                fournisseur.statut || ''
              ])
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10] as [number, number, number, number]
        }
      }
    };

    this.pdfService.generatePdf(docDefinition, 'fournisseurs.pdf');
  }

  viewFournisseur(id: string): void {
    this.router.navigate(['/fournisseurs/view', id]);
  }

  editFournisseur(id: string): void {
    this.router.navigate(['/fournisseurs/edit', id]);
  }

  deleteFournisseur(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      this.fournisseurService.deleteFournisseur(id).subscribe({
        next: () => {
          this.snackBar.open('Fournisseur supprimé avec succès', 'Fermer', {
            duration: 3000
          });
          this.loadFournisseurs();
        },
        error: (err) => {
          this.snackBar.open('Erreur lors de la suppression du fournisseur', 'Fermer', {
            duration: 3000
          });
          console.error(err);
        }
      });
    }
  }

  addFournisseur(): void {
    this.router.navigate(['/fournisseurs/add']);
  }
} 