import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
    // Chargement des factures
    const storedFactures = localStorage.getItem('factures');
    if (storedFactures) {
      this.factures = JSON.parse(storedFactures);
      this.updateFacturesStatus();
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

    // Chargement des paiements
    const storedPaiements = localStorage.getItem('paiements');
    if (storedPaiements) {
      this.paiements = JSON.parse(storedPaiements);
    }

    // Chargement des relances
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
      // Calcul du total des paiements pour cette facture
      const facturePayments = this.paiements.filter(p => p.factureId === facture._id || p.factureRef === facture.reference);
      const totalPaid = facturePayments.reduce((sum, payment) => sum + payment.montant, 0);
      
      // Vérification de l'état de paiement
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
    
    // Récupération des informations détaillées des produits
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

    // Récupération des paiements de cette facture
    this.selectedFacturePaiements = this.paiements.filter(
      p => p.factureId === this.selectedFacture._id || p.factureRef === this.selectedFacture.reference
    );

    // Récupération des relances de cette facture
    this.selectedFactureRelances = this.relances.filter(
      r => r.factureId === this.selectedFacture._id || r.factureRef === this.selectedFacture.reference
    );
  }

  closeModal() {
    this.selectedFacture = null;
    this.selectedFactureIndex = -1;
  }

  getRemainingAmount(): number {
    if (!this.selectedFacture) return 0;
    
    const totalPaid = this.selectedFacturePaiements.reduce((sum, payment) => sum + payment.montant, 0);
    return Math.max(0, this.selectedFacture.montantTTC - totalPaid);
  }

  addPayment(index: number) {
    this.selectedFactureIndex = index;
    this.selectedFacture = { ...this.factures[index] };
    
    // Calcul du montant restant à payer
    this.selectedFacturePaiements = this.paiements.filter(
      p => p.factureId === this.selectedFacture._id || p.factureRef === this.selectedFacture.reference
    );
    this.currentRemainingAmount = this.getRemainingAmount();
    
    // Mise à jour du validateur de montant maximum
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
    this.paymentForm.reset();
  }

  submitPayment() {
    if (this.paymentForm.valid && this.selectedFacture) {
      const newPayment = {
        factureRef: this.selectedFacture.reference,
        factureId: this.selectedFacture._id,
        montant: parseFloat(this.paymentForm.value.montant),
        modePaiement: this.paymentForm.value.modePaiement,
        reference: this.paymentForm.value.reference || `PAY-${Date.now().toString().slice(-6)}`,
        date: new Date()
      };

      // Ajout du paiement
      this.paiements.push(newPayment);
      localStorage.setItem('paiements', JSON.stringify(this.paiements));

      // Mise à jour de la liste des paiements de la facture sélectionnée
      this.selectedFacturePaiements.push(newPayment);
      
      // Mise à jour du statut de la facture
      this.updateFacturesStatus();
      this.selectedFacture = { ...this.factures[this.selectedFactureIndex] };
      
      // Fermeture du modal
      this.closePaymentModal();
      
      alert('Paiement enregistré avec succès !');
    }
  }

  sendReminder(index: number) {
    const facture = this.factures[index];
    const client = this.clients.find(c => c._id === facture.client || c.nom === facture.client);
    
    if (!client) {
      alert('Client introuvable');
      return;
    }
    
    // Détermination du type de relance en fonction du nombre de relances déjà envoyées
    const factureRelances = this.relances.filter(
      r => r.factureRef === facture.reference
    );
    
    let type = '1ère Relance';
    if (factureRelances.length === 1) type = '2ème Relance';
    else if (factureRelances.length >= 2) type = 'Mise en Demeure';
    
    const newRelance = {
      factureRef: facture.reference,
      factureId: facture._id,
      client: client.nom,
      email: client.email,
      type: type,
      moyen: 'Email',
      date: new Date(),
      statut: 'Envoyée'
    };
    
    // Ajout de la relance
    this.relances.push(newRelance);
    localStorage.setItem('relances', JSON.stringify(this.relances));
    
    // Si la facture est ouverte dans le modal, mettre à jour la liste des relances
    if (this.selectedFactureIndex === index) {
      this.selectedFactureRelances.push(newRelance);
    }
    
    alert(`Relance envoyée par email à ${client.email}`);
  }

  sendReminderToSelected() {
    this.sendReminder(this.selectedFactureIndex);
  }

  printFacture() {
    alert(`Impression de la facture ${this.selectedFacture.reference}`);
    // En situation réelle, cela déclencherait une fonction d'impression ou de génération de PDF
  }
}
