import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-devis-list',
  templateUrl: './devis-list.component.html',
  styleUrls: ['./devis-list.component.css']
})
export class DevisListComponent implements OnInit {
  devis: any[] = [];
  clients: any[] = [];
  produitsList: any[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  selectedDevis: any = null;
  selectedDevisProduits: any[] = [];
  selectedDevisIndex: number = -1;

  constructor() { }

  ngOnInit(): void {
    // Chargement des devis
    const storedDevis = localStorage.getItem('devis');
    if (storedDevis) {
      this.devis = JSON.parse(storedDevis);
    }

    // Chargement des clients
    const storedClients = localStorage.getItem('clients');
    if (storedClients) {
      this.clients = JSON.parse(storedClients);
    }

    // Pour la démo, produits fictifs
    this.produitsList = [
      { _id: 'prod1', nom: 'Produit A', prix: 100 },
      { _id: 'prod2', nom: 'Produit B', prix: 200 },
      { _id: 'prod3', nom: 'Produit C', prix: 150 }
    ];
  }

  get filteredDevis() {
    return this.devis.filter(d => {
      const matchesSearch = this.searchTerm.trim() === '' || 
        d.reference.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        this.getClientName(d.client).toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.statusFilter === '' || d.statut === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  getClientName(clientId: string): string {
    const client = this.clients.find(c => c._id === clientId || c.nom === clientId);
    return client ? client.nom : 'Client inconnu';
  }

  isHighlighted(devis: any): boolean {
    // Mise en évidence des devis qui approchent de leur date d'échéance
    if (devis.statut === 'Envoyé') {
      const echeance = new Date(devis.echeance);
      const today = new Date();
      const diffTime = echeance.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays >= 0;
    }
    return false;
  }

  viewDevis(index: number) {
    this.selectedDevisIndex = index;
    this.selectedDevis = { ...this.devis[index] };
    
    // Récupération des informations détaillées des produits
    this.selectedDevisProduits = [];
    for (const item of this.selectedDevis.produits) {
      const produit = this.produitsList.find(p => p._id === item.produitId);
      if (produit) {
        this.selectedDevisProduits.push({
          nom: produit.nom,
          prix: produit.prix,
          quantite: item.quantite
        });
      }
    }
  }

  closeModal() {
    this.selectedDevis = null;
    this.selectedDevisIndex = -1;
  }

  editDevis(index: number) {
    // Pour une démo simple, cela redirige vers le formulaire de modification
    alert(`Édition du devis ${this.devis[index].reference}`);
  }

  editSelectedDevis() {
    this.editDevis(this.selectedDevisIndex);
    this.closeModal();
  }

  sendDevis(index: number) {
    this.devis[index].statut = 'Envoyé';
    localStorage.setItem('devis', JSON.stringify(this.devis));
  }

  sendSelectedDevis() {
    this.sendDevis(this.selectedDevisIndex);
    this.selectedDevis.statut = 'Envoyé';
  }

  changeDevisStatus(newStatus: string) {
    this.devis[this.selectedDevisIndex].statut = newStatus;
    this.selectedDevis.statut = newStatus;
    localStorage.setItem('devis', JSON.stringify(this.devis));
  }

  convertToFacture(index: number) {
    const devisToConvert = this.devis[index];
    
    // Création de la facture à partir du devis
    const newFacture = {
      reference: `FAC-${devisToConvert.reference.substring(4)}`,
      dateEmission: new Date(),
      echeance: devisToConvert.echeance,
      client: devisToConvert.client,
      produits: devisToConvert.produits,
      montantHT: devisToConvert.montantHT,
      montantTVA: devisToConvert.montantTVA,
      montantTTC: devisToConvert.montantTTC,
      tva: devisToConvert.tva,
      statut: 'Validée',
      devisOrigine: devisToConvert.reference
    };

    // Enregistrement de la facture
    const factures = JSON.parse(localStorage.getItem('factures') || '[]');
    factures.push(newFacture);
    localStorage.setItem('factures', JSON.stringify(factures));

    // Mise à jour du statut du devis
    this.devis[index].statut = 'Converti';
    localStorage.setItem('devis', JSON.stringify(this.devis));

    alert(`Le devis ${devisToConvert.reference} a été converti en facture ${newFacture.reference}`);
  }

  convertSelectedDevisToFacture() {
    this.convertToFacture(this.selectedDevisIndex);
    this.closeModal();
  }

  deleteDevis(index: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      this.devis.splice(index, 1);
      localStorage.setItem('devis', JSON.stringify(this.devis));
    }
  }
}
