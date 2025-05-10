import { Component, OnInit, ViewChild } from '@angular/core';
import { CommandesService, CommandeAchat } from '../../../services/commandes.service';
import { FournisseurService } from '../../../services/fournisseur.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PdfService } from '../../../services/pdf.service';

@Component({
  selector: 'app-list-commandes',
  templateUrl: './list-commandes.component.html',
  styleUrls: ['./list-commandes.component.css']
})
export class ListCommandesComponent implements OnInit {
  commandes: CommandeAchat[] = [];
  dataSource: MatTableDataSource<CommandeAchat>;
  isLoading = false;
  displayedColumns: string[] = ['id', 'produit', 'fournisseur', 'date', 'quantite', 'statut', 'actions'];
  
  // Search and filter properties
  searchTerm: string = '';
  selectedCategorie: string = '';
  categories: string[] = [];
  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedFournisseur: string = '';
  fournisseurs: any[] = [];
  
  // Pagination properties
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  totalItems: number = 0;
  pageSize: number = 5;
  currentPage: number = 0;

  constructor(
    private commandesService: CommandesService,
    private fournisseurService: FournisseurService,
    private snackBar: MatSnackBar,
    private router: Router,
    private pdfService: PdfService
  ) {
    this.dataSource = new MatTableDataSource<CommandeAchat>([]);
  }

  ngOnInit(): void {
    // Fetch categories for filter
    this.commandesService.getCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: () => this.categories = []
    });
    // Fetch fournisseurs for filter
    this.fournisseurService.getAllFournisseurs().subscribe({
      next: (fournisseurs) => this.fournisseurs = fournisseurs,
      error: () => this.fournisseurs = []
    });
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.isLoading = true;
    const params = {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm,
      categorie: this.selectedCategorie,
      startDate: this.startDate ? this.startDate.toISOString().split('T')[0] : undefined,
      endDate: this.endDate ? this.endDate.toISOString().split('T')[0] : undefined,
      fournisseur: this.selectedFournisseur
    };

    this.commandesService.getCommandesWithFilters(params).subscribe({
      next: (response: any) => {
        this.commandes = response;
        this.dataSource.data = this.commandes;
        this.totalItems = this.commandes.length;
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du chargement des commandes', 'Fermer', {
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
    this.loadCommandes();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCommandes();
  }

  exportToPDF(): void {
    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Liste des Commandes', style: 'header' },
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*', '*'],
            body: [
              ['ID', 'Produit', 'Fournisseur', 'Date', 'Quantité', 'Statut'],
              ...this.commandes.map(commande => [
                commande._id || '',
                commande.produit?.nom || '',
                commande.fournisseurID?.nom || '',
                new Date(commande.date).toLocaleDateString(),
                commande.quantite.toString(),
                commande.statut || ''
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

    this.pdfService.generatePdf(docDefinition, 'commandes.pdf');
  }

  editCommande(id: string): void {
    this.router.navigate(['/commandes/edit', id]);
  }

  viewCommande(id: string): void {
    this.router.navigate(['/commandes/view', id]);
  }

  deleteCommande(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      this.commandesService.deleteCommande(id).subscribe({
        next: () => {
          this.snackBar.open('Commande supprimée avec succès', 'Fermer', {
            duration: 3000
          });
          this.loadCommandes();
        },
        error: (err) => {
          this.snackBar.open('Erreur lors de la suppression de la commande', 'Fermer', {
            duration: 3000
          });
          console.error(err);
        }
      });
    }
  }

  addCommande(): void {
    this.router.navigate(['/commandes/add']);
  }
} 