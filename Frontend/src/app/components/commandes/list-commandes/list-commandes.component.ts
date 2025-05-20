import { Component, OnInit, ViewChild } from '@angular/core';
import { CommandesService, CommandeAchat } from '../../../services/commandes.service';
import { FournisseurService, Fournisseur } from '../../../services/fournisseur.service';
import { StockManagementService } from '../../../services/gestion-de-stock.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Produit } from '../../../Models/Produit';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-list-commandes',
  templateUrl: './list-commandes.component.html',
  styleUrls: ['./list-commandes.component.css']
})
export class ListCommandesComponent implements OnInit {
  // Table configuration
  commandes: CommandeAchat[] = [];
  dataSource: MatTableDataSource<CommandeAchat>;
  displayedColumns: string[] = ['id', 'produit', 'fournisseur', 'date', 'quantite', 'type_livraison', 'statut', 'actions'];
  
  // Loading state
  isLoading = false;
  
  // Filter properties
  searchTerm: string = '';
  selectedProduit: string = '';
  produits: Produit[] = [];
  selectedFournisseur: string = '';
  fournisseurs: Fournisseur[] = [];
  
  // Pagination properties
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  totalItems: number = 0;
  pageSize: number = 5;
  currentPage: number = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor(
    private commandesService: CommandesService,
    private fournisseurService: FournisseurService,
    private stockService: StockManagementService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dataSource = new MatTableDataSource<CommandeAchat>([]);
  }

  ngOnInit(): void {
    this.initializeDataSource();
    this.setupRouteListener();
    this.loadFilterData();
    this.loadCommandes();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  // Initialization methods
  private initializeDataSource(): void {
    this.dataSource = new MatTableDataSource<CommandeAchat>([]);
  }

  private setupRouteListener(): void {
    this.route.queryParams.subscribe(params => {
      if (params['refresh']) {
        this.loadCommandes();
      }
    });
  }

  private loadFilterData(): void {
    this.loadProduits();
    this.loadFournisseurs();
  }

  private loadProduits(): void {
    this.stockService.getProduits().subscribe({
      next: (prods) => this.produits = prods,
      error: (err) => {
        this.showNotification('Erreur lors du chargement des produits', 'error');
        console.error(err);
        this.produits = [];
      }
    });
  }

  private loadFournisseurs(): void {
    this.fournisseurService.getAllFournisseurs().subscribe({
      next: (fournisseurs) => this.fournisseurs = fournisseurs,
      error: () => this.fournisseurs = []
    });
  }

  // Data loading methods
  loadCommandes(): void {
    this.isLoading = true;
    const params = {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm,
      produit: this.selectedProduit,
      fournisseur: this.selectedFournisseur || undefined
    };

    this.commandesService.getCommandesWithFilters(params).subscribe({
      next: (response: any) => {
        if (response?.commandes) {
          this.handleSuccessfulLoad(response);
        } else {
          this.handleEmptyResponse();
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.handleLoadError(err);
      }
    });
  }

  private handleSuccessfulLoad(response: any): void {
    this.commandes = response.commandes.map((commande: CommandeAchat) => ({
      ...commande,
      createdAt: new Date(commande.createdAt)
    }));
    this.dataSource.data = this.commandes;
    this.totalItems = response.totalItems;
  }

  private handleEmptyResponse(): void {
    this.commandes = [];
    this.dataSource.data = [];
    this.totalItems = 0;
  }

  private handleLoadError(err: any): void {
    console.error('Error loading commandes:', err);
    this.showNotification('Erreur lors du chargement des commandes', 'error');
    this.isLoading = false;
    this.handleEmptyResponse();
  }

  // Event handlers
  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadCommandes();
  }

  applyFilter(): void {
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadCommandes();
  }

  // Navigation methods
  editCommande(id: string): void {
    this.router.navigate(['/commandes/edit', id]);
  }

  viewCommande(id: string): void {
    this.router.navigate(['/commandes/view', id]);
  }

  addCommande(): void {
    this.router.navigate(['/commandes/add']);
  }

  // CRUD operations
  deleteCommande(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      this.commandesService.deleteCommande(id).subscribe({
        next: () => {
          this.showNotification('Commande supprimée avec succès', 'success');
          this.loadCommandes();
        },
        error: (err) => {
          this.showNotification('Erreur lors de la suppression de la commande', 'error');
          console.error(err);
        }
      });
    }
  }

  // PDF Export
  exportToPDF(): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const rowHeight = 10;
    let y = 20;

    this.addPDFHeader(doc, pageWidth, y);
    y += 10;

    y = this.addPDFFilters(doc, margin, y);
    y += 5;

    const headers = ['ID', 'Produit', 'Fournisseur', 'Date', 'Quantité', 'Type Livraison', 'Statut'];
    const columnWidths = [15, 40, 40, 30, 20, 25, 20];
    
    y = this.addPDFTableHeaders(doc, headers, columnWidths, margin, y);
    y += 5;

    this.addPDFTableData(doc, columnWidths, margin, rowHeight, y);

    doc.save('liste-commandes.pdf');
  }

  private addPDFHeader(doc: jsPDF, pageWidth: number, y: number): void {
    doc.setFontSize(16);
    doc.text('Liste des Commandes', pageWidth / 2, y, { align: 'center' });
  }

  private addPDFFilters(doc: jsPDF, margin: number, y: number): number {
    doc.setFontSize(10);
    if (this.searchTerm) {
      doc.text(`Recherche: ${this.searchTerm}`, margin, y);
      y += 5;
    }
    if (this.selectedProduit) {
      doc.text(`Produit: ${this.selectedProduit}`, margin, y);
      y += 5;
    }
    if (this.selectedFournisseur) {
      doc.text(`Fournisseur: ${this.selectedFournisseur}`, margin, y);
      y += 5;
    }
    return y;
  }

  private addPDFTableHeaders(doc: jsPDF, headers: string[], columnWidths: number[], margin: number, y: number): number {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    let x = margin;
    headers.forEach((header, index) => {
      doc.text(header, x, y);
      x += columnWidths[index];
    });
    return y;
  }

  private addPDFTableData(doc: jsPDF, columnWidths: number[], margin: number, rowHeight: number, y: number): void {
    doc.setFont('helvetica', 'normal');
    this.commandes.forEach(commande => {
      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
      this.addRowToPDF(doc, commande, y, margin, columnWidths);
      y += rowHeight;
    });
  }

  private addRowToPDF(doc: jsPDF, commande: CommandeAchat, y: number, margin: number, columnWidths: number[]): void {
    let x = margin;
    const data = [
      commande._id?.toString() || '',
      commande.produit?.nom || '',
      commande.fournisseurs[0]?.fournisseurID?.nom || '',
      new Date(commande.createdAt).toLocaleDateString(),
      commande.quantite.toString(),
      commande.type_livraison || '',
      commande.statut || ''
    ];
    data.forEach((value, index) => {
      doc.text(value, x, y);
      x += columnWidths[index];
    });
  }

  // Utility methods
  private showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
} 