import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StockManagementService } from '../../services/stock-movements.service';
import { MouvementStock } from '../../Models/MouvementStock';
import { Produit } from '../../Models/Produit';
import { ActivatedRoute } from '@angular/router';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver'; // Keep this import
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-ms',
  templateUrl: './ms.component.html',
  styleUrls: ['./ms.component.css']
})
export class MSComponent implements OnInit {
  stockMovements: MouvementStock[] = [];
  errorMessage: string | null = null;

  newMovement: Partial<MouvementStock> = {
    produit: '',
    type: '',
    quantite: 0,
    date: new Date()
  };

  editingMovement: MouvementStock | null = null;
  showForm = false;

  constructor(
    private stockService: StockManagementService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const produitId = params['produitId'];
      if (produitId) {
        this.newMovement = {
          produit: produitId,
          type: '',
          quantite: 0,
          date: new Date()
        };
        this.showForm = true;
        this.editingMovement = null;
        this.cdr.detectChanges();
      }
    });
    this.loadStockMovements();
  }

  loadStockMovements(): void {
    console.log('loadStockMovements called');
    this.stockService.getAllStockMovements().subscribe({
      next: (data: MouvementStock[]) => {
        console.log('Received movements:', data);
        this.stockMovements = [...(data || []).filter(m => m.produit != null)];
        this.errorMessage = null;
        this.checkStockAlerts();
        this.cdr.detectChanges();
        console.log('stockMovements updated:', this.stockMovements);
      },
      error: err => {
        this.errorMessage = 'Erreur lors du chargement des mouvements : ' + err.message;
        this.stockMovements = [];
        this.cdr.detectChanges();
        console.log('loadStockMovements failed:', err);
      }
    });
  }

  getUniqueLowStockProducts(): any[] {
    const uniqueProductsMap = new Map<string, any>();
  
    this.stockMovements.forEach(movement => {
      const product = movement.produit;
      if (this.isLowStock(movement) && !uniqueProductsMap.has(this.getProduitNom(product))) {
        uniqueProductsMap.set(this.getProduitNom(product), product);
      }
    });
  
    return Array.from(uniqueProductsMap.values());
  }

  getProduitNom(produit: string | Produit): string {
    return typeof produit === 'string' ? 'ID: ' + produit : produit?.nom ?? 'Produit inconnu';
  }

  getProduitId(produit: string | Produit): string {
    return typeof produit === 'string' ? produit : produit?._id ?? '';
  }

  getProduitStock(produit: string | Produit): number {
    return typeof produit === 'string' ? 0 : produit?.stock ?? 0;
  }

  getProduitSeuil(produit: string | Produit): number {
    return typeof produit === 'string' ? 0 : produit?.seuilAlerte ?? 0;
  }

  isLowStock(movement: MouvementStock): boolean {
    const produit = movement.produit;
    if (typeof produit === 'string' || !produit) return false;
    return produit.stock <= produit.seuilAlerte;
  }

  hasLowStockItems(): boolean {
    return this.stockMovements.some(m => this.isLowStock(m));
  }

  checkStockAlerts(): void {
    this.stockMovements.forEach(m => {
      if (this.isLowStock(m)) {
        const produit = m.produit as Produit;
        console.warn(`⚠️ Stock bas détecté pour : ${produit.nom} (Stock: ${produit.stock}, Seuil: ${produit.seuilAlerte})`);
      }
    });
  }

  createMovement(): void {
    const mouvement: MouvementStock = {
      produit: this.newMovement.produit as string,
      type: this.newMovement.type!,
      quantite: this.newMovement.quantite!,
      date: new Date(this.newMovement.date!).toISOString()
    };

    this.stockService.createStockMovement(mouvement).subscribe({
      next: () => {
        this.loadStockMovements();
        this.resetForm();
      },
      error: err => {
        this.errorMessage = 'Erreur lors de la création : ' + err.message;
      }
    });
  }

  editMovement(movement: MouvementStock): void {
    console.log('editMovement called with:', movement);
    this.editingMovement = {
      ...movement,
      produit: this.getProduitId(movement.produit),
      type: movement.type || 'entrée',
      quantite: movement.quantite || 0,
      date: new Date(movement.date)
    };
    console.log('editingMovement initialized:', this.editingMovement);
    this.showForm = true;
  }

  updateMovement(): void {
    console.log('updateMovement called');
    if (!this.editingMovement || !this.editingMovement._id) {
      this.errorMessage = 'Aucun mouvement à modifier.';
      console.log('Error: No movement to update');
      return;
    }

    const movement: MouvementStock = {
      produit: this.editingMovement.produit as string,
      type: this.editingMovement.type || 'entrée',
      quantite: Number(this.editingMovement.quantite) || 0,
      date: new Date(this.editingMovement.date || Date.now()).toISOString()
    };

    console.log('Update payload to be sent:', movement);

    if (!movement.produit || !movement.type || movement.quantite < 0 || !movement.date) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement (Produit ID, Type, Quantité ≥ 0, Date).';
      console.log('Validation failed:', movement);
      return;
    }

    this.stockService.updateStockMovement(this.editingMovement._id, movement).subscribe({
      next: (updatedMovement) => {
        console.log('Update successful, received:', updatedMovement);
        this.loadStockMovements();
        this.cancelEdit();
        this.errorMessage = 'Mouvement mis à jour avec succès !';
        setTimeout(() => (this.errorMessage = ''), 3000);
        console.log('updateMovement completed');
      },
      error: (err) => {
        console.error('Update error:', err);
        const errorMessage = err.error?.message || 'Erreur lors de la mise à jour';
        this.errorMessage = `Erreur: ${errorMessage}`;
        console.log('updateMovement failed');
      }
    });
  }

  updateField(field: keyof MouvementStock, value: string | number | Date): void {
    console.log(`Updating ${field} to:`, value);
    if (this.editingMovement) {
      switch (field) {
        case 'produit':
          this.editingMovement.produit = value as string;
          break;
        case 'type':
          this.editingMovement.type = value as string;
          break;
        case 'quantite':
          this.editingMovement.quantite = Number(value);
          break;
        case 'date':
          this.editingMovement.date = value instanceof Date ? value : new Date(value as string);
          break;
        default:
          console.warn(`Field ${field} not handled in updateField`);
      }
    } else {
      switch (field) {
        case 'produit':
          this.newMovement.produit = value as string;
          break;
        case 'type':
          this.newMovement.type = value as string;
          break;
        case 'quantite':
          this.newMovement.quantite = Number(value);
          break;
        case 'date':
          this.newMovement.date = value instanceof Date ? value : new Date(value as string);
          break;
        default:
          console.warn(`Field ${field} not handled in updateField`);
      }
    }
    console.log('Current editingMovement:', this.editingMovement);
  }

  updateDate(date: string): void {
    const parsedDate = date ? new Date(date) : new Date();
    if (this.editingMovement) {
      this.editingMovement.date = parsedDate;
    } else {
      this.newMovement.date = parsedDate;
    }
    console.log('Updated date:', parsedDate);
  }

  deleteMovement(id: string): void {
    if (!id || !confirm('Êtes-vous sûr de vouloir supprimer ce mouvement ?')) return;

    this.stockService.deleteStockMovement(id).subscribe({
      next: () => this.loadStockMovements(),
      error: err => this.errorMessage = 'Erreur lors de la suppression : ' + err.message
    });
  }

  onSubmit(): void {
    console.log('onSubmit called');
    const movement = this.editingMovement || this.newMovement;
    console.log('Movement data before submission:', movement);

    if (!movement.produit || !movement.type || movement.quantite! < 0 || !movement.date) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      console.log('Validation failed:', { produit: movement.produit, type: movement.type, quantite: movement.quantite, date: movement.date });
      return;
    }

    if (this.editingMovement) {
      console.log('Calling updateMovement with:', this.editingMovement);
      this.updateMovement();
    } else {
      console.log('Calling createMovement');
      this.createMovement();
    }
  }

  isString(value: any): boolean {
    return typeof value === 'string';
  }

  resetForm(): void {
    this.newMovement = {
      produit: '',
      type: '',
      quantite: 0,
      date: new Date()
    };
    this.showForm = false;
  }

  cancelEdit(): void {
    console.log('cancelEdit called');
    this.editingMovement = null;
    this.showForm = false;
    this.cdr.detectChanges();
    console.log('showForm set to:', this.showForm, 'editingMovement set to:', this.editingMovement);
  }

  exportToExcel(): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Mouvements de Stock');

    worksheet.columns = [
      { header: 'Produit', key: 'produit', width: 20 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Quantité', key: 'quantite', width: 15 },
      { header: 'Date', key: 'date', width: 25 },
      { header: 'Alerte', key: 'alerte', width: 15 }
    ];

    this.stockMovements.forEach(movement => {
      worksheet.addRow({
        produit: this.getProduitNom(movement.produit),
        type: movement.type?.toUpperCase(),
        quantite: movement.quantite,
        date: new Date(movement.date).toLocaleString(),
        alerte: this.isLowStock(movement) ? 'Oui' : 'Non'
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFCCCCCC' }
    };

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      FileSaver.saveAs(blob, `Mouvements_Stock_${new Date().toISOString().split('T')[0]}.xlsx`);
    });
  }

  exportToPDF(): void {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    (pdf as any).autoTable({
      head: [['Produit', 'Type', 'Quantité', 'Date', 'Alerte']],
      body: this.stockMovements.map(movement => [
        this.getProduitNom(movement.produit),
        movement.type?.toUpperCase(),
        movement.quantite,
        new Date(movement.date).toLocaleString(),
        this.isLowStock(movement) ? 'Oui' : 'Non'
      ]),
      startY: 10,
      margin: { top: 10, left: 10, right: 10, bottom: 10 },
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });

    pdf.save(`Mouvements_Stock_${new Date().toISOString().split('T')[0]}.pdf`);
  }
}