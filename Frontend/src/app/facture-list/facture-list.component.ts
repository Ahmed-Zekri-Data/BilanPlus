import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-facture-list',
  templateUrl: './facture-list.component.html',
  styleUrls: ['./facture-list.component.css']
})
export class FactureListComponent implements OnInit {
  factures: any[] = [];
  clients: any[] = [];
  produitsList: any[] = [];
  paiements: any[] = [];
  relances: any[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  
  selectedFacture: any = null;
  selectedFactureIndex: number = -1;
  selectedFactureProduits: any[] = [];
  selectedFacturePaiements: any[] = [];
  selectedFactureRelances: any[] = [];
  
  showPaymentModal: boolean = false;
  paymentForm: FormGroup;
  currentRemainingAmount: number = 0;

  constructor() {
    this.paymentForm = new FormGroup({
      montant: new FormControl('', [
        Validators.required, 
        Validators.min(0.01)
      ]),
      modePaiement: new FormControl('', [Validators.required]),
      reference: new FormControl('')
    });
  }

  ngOnInit(): void {
    const storedFactures = localStorage.getItem('factures');
    if (storedFactures) {
      this.factures = JSON.parse(storedFactures);
      this.factures = this.factures.map(facture => ({
        ...facture,
        _id: facture._id || uuidv4(),
        montantTTC: Number(facture.montantTTC) || 0 // Assurer que montantTTC est un nombre
      }));
      localStorage.setItem('factures', JSON.stringify(this.factures));
      this.updateFacturesStatus();
    }

    const storedClients = localStorage.getItem('clients');
    if (storedClients) {
      this.clients = JSON.parse(storedClients);
    }

    this.produitsList = [
      { _id: 'prod1', nom: 'Produit A', prix: 100 },
      { _id: 'prod2', nom: 'Produit B', prix: 200 },
      { _id: 'prod3', nom: 'Produit C', prix: 150 }
    ];

    const storedPaiements = localStorage.getItem('paiements');
    if (storedPaiements) {
      this.paiements = JSON.parse(storedPaiements);
    }

    const storedRelances = localStorage.getItem('relances');
    if (storedRelances) {
      this.relances = JSON.parse(storedRelances);
    }
  }

  get filteredFactures() {
    return this.factures.filter(f => {
      const matchesSearch = this.searchTerm.trim() === '' || 
        f.reference.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        this.getClientName(f.client).toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.statusFilter === '' || f.statut === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  getClientName(clientId: string): string {
    const client = this.clients.find(c => c._id === clientId || c.nom === clientId);
    return client ? client.nom : 'Client inconnu';
  }

  updateFacturesStatus() {
    const today = new Date();
    
    this.factures.forEach(facture => {
      const facturePayments = this.paiements.filter(p => p.factureId === facture._id);
      const totalPaid = facturePayments.reduce((sum, payment) => sum + Number(payment.montant), 0);
      
      if (totalPaid >= facture.montantTTC) {
        facture.statut = 'Payée';
      } else if (totalPaid > 0) {
        facture.statut = 'Paiement Partiel';
      } else if (new Date(facture.echeance) < today && facture.statut !== 'Payée') {
        facture.statut = 'En retard';
      }
    });
    
    localStorage.setItem('factures', JSON.stringify(this.factures));
  }

  isNearDueDate(facture: any): boolean {
    if (facture.statut === 'Payée') return false;
    
    const echeance = new Date(facture.echeance);
    const today = new Date();
    const diffTime = echeance.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 3 && diffDays >= 0;
  }

  isOverdue(facture: any): boolean {
    if (facture.statut === 'Payée') return false;
    
    const echeance = new Date(facture.echeance);
    const today = new Date();
    
    return echeance < today;
  }

  viewFacture(index: number) {
    this.selectedFactureIndex = index;
    this.selectedFacture = { ...this.factures[index] };
    
    this.selectedFactureProduits = [];
    for (const item of this.selectedFacture.produits) {
      const produit = this.produitsList.find(p => p._id === item.produitId);
      if (produit) {
        this.selectedFactureProduits.push({
          nom: produit.nom,
          prix: produit.prix,
          quantite: item.quantite
        });
      }
    }

    this.selectedFacturePaiements = this.paiements.filter(p => p.factureId === this.selectedFacture._id);
    this.selectedFactureRelances = this.relances.filter(r => r.factureId === this.selectedFacture._id);
  }

  closeModal() {
    this.selectedFacture = null;
    this.selectedFactureIndex = -1;
  }

  getRemainingAmount(): number {
    if (!this.selectedFacture || !this.selectedFacture.montantTTC) {
      console.warn('Facture non définie ou montantTTC manquant:', this.selectedFacture);
      return 0;
    }
    
    const totalPaid = this.selectedFacturePaiements.reduce((sum, payment) => sum + Number(payment.montant || 0), 0);
    const remaining = Number(this.selectedFacture.montantTTC) - totalPaid;
    
    if (isNaN(remaining)) {
      console.error('Calcul du reste à payer invalide:', {
        montantTTC: this.selectedFacture.montantTTC,
        totalPaid
      });
      return 0;
    }
    
    return Math.max(0, remaining);
  }

  addPayment(index: number) {
    this.selectedFactureIndex = index;
    this.selectedFacture = { ...this.factures[index] };
    
    // Vérifier que la facture est valide
    if (!this.selectedFacture._id || !this.selectedFacture.montantTTC) {
      console.error('Facture invalide:', this.selectedFacture);
      alert('Erreur : La facture sélectionnée est invalide.');
      return;
    }
    
    this.selectedFacturePaiements = this.paiements.filter(p => p.factureId === this.selectedFacture._id);
    this.currentRemainingAmount = this.getRemainingAmount();
    
    // Vérifier si currentRemainingAmount est valide
    if (this.currentRemainingAmount <= 0 && this.selectedFacture.statut !== 'Payée') {
      console.warn('Reste à payer incohérent:', {
        facture: this.selectedFacture,
        currentRemainingAmount: this.currentRemainingAmount
      });
      this.currentRemainingAmount = Number(this.selectedFacture.montantTTC);
    }
    
    this.paymentForm.reset({
      montant: '',
      modePaiement: '',
      reference: ''
    });
    
    this.paymentForm.get('montant')?.setValidators([
      Validators.required,
      Validators.min(0.01),
      Validators.max(this.currentRemainingAmount)
    ]);
    this.paymentForm.get('montant')?.updateValueAndValidity();
    
    this.showPaymentModal = true;
  }

  addPaymentToSelected() {
    this.addPayment(this.selectedFactureIndex);
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.paymentForm.reset({
      montant: '',
      modePaiement: '',
      reference: ''
    });
    this.paymentForm.get('montant')?.setValidators([
      Validators.required,
      Validators.min(0.01)
    ]);
    this.paymentForm.get('montant')?.updateValueAndValidity();
  }

  submitPayment() {
    if (this.paymentForm.valid && this.selectedFacture) {
      const montant = Number(this.paymentForm.value.montant);
      if (montant > this.currentRemainingAmount) {
        this.paymentForm.get('montant')?.setErrors({ max: true });
        return;
      }

      const newPayment = {
        factureId: this.selectedFacture._id,
        montant: montant,
        modePaiement: this.paymentForm.value.modePaiement,
        reference: this.paymentForm.value.reference || `PAY-${Date.now().toString().slice(-6)}`,
        date: new Date()
      };

      this.paiements.push(newPayment);
      localStorage.setItem('paiements', JSON.stringify(this.paiements));

      this.selectedFacturePaiements.push(newPayment);
      
      this.updateFacturesStatus();
      this.selectedFacture = { ...this.factures[this.selectedFactureIndex] };
      
      this.closePaymentModal();
      
      alert('Paiement enregistré avec succès !');
    } else {
      this.paymentForm.markAllAsTouched();
    }
  }

  sendReminder(index: number) {
    const facture = this.factures[index];
    const client = this.clients.find(c => c._id === facture.client || c.nom === facture.client);
    
    if (!client) {
      alert('Client introuvable');
      return;
    }
    
    const factureRelances = this.relances.filter(r => r.factureId === facture._id);
    
    let type = '1ère Relance';
    if (factureRelances.length === 1) type = '2ème Relance';
    else if (factureRelances.length >= 2) type = 'Mise en Demeure';
    
    const newRelance = {
      factureId: facture._id,
      client: client.nom,
      email: client.email,
      type: type,
      moyen: 'Email',
      date: new Date(),
      statut: 'Envoyée'
    };
    
    this.relances.push(newRelance);
    localStorage.setItem('relances', JSON.stringify(this.relances));
    
    if (this.selectedFactureIndex === index) {
      this.selectedFactureRelances.push(newRelance);
    }
    
    alert(`Relance envoyée par email à ${client.email}`);
  }

  sendReminderToSelected() {
    this.sendReminder(this.selectedFactureIndex);
  }

convertToPDF() {
  if (!this.selectedFacture) {
    alert('Aucune facture sélectionnée.');
    return;
  }

  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`Facture: ${this.selectedFacture.reference}`, 10, 20);
  doc.text(`Client: ${this.getClientName(this.selectedFacture.client)}`, 10, 30);
  doc.text(`Date d'émission: ${new Date(this.selectedFacture.dateEmission).toLocaleDateString()}`, 10, 40);
  doc.text(`Échéance: ${new Date(this.selectedFacture.echeance).toLocaleDateString()}`, 10, 50);
  doc.text(`Total HT: ${this.selectedFacture.montantHT} €`, 10, 60);
  doc.text(`TVA (${this.selectedFacture.tva}%): ${this.selectedFacture.montantTVA} €`, 10, 70);
  doc.text(`Total TTC: ${this.selectedFacture.montantTTC} €`, 10, 80);

  doc.save(`${this.selectedFacture.reference}.pdf`);
}
}