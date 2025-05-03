import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators, FormBuilder } from '@angular/forms';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-devis-form',
  templateUrl: './devis-form.component.html',
  styleUrls: ['./devis-form.component.css']
})
export class DevisFormComponent implements OnInit {
  devisForm: FormGroup;
  clients: any[] = [];
  produitsList: any[] = [];
  message: string = '';

  constructor(private fb: FormBuilder) {
    this.devisForm = this.fb.group({
      reference: ['', Validators.required],
      client: ['', Validators.required],
      produits: this.fb.array([]),
      tva: ['', Validators.required],
      echeance: ['', Validators.required],
      statut: ['Brouillon']
    });
  }
  dateInférieureOuÉgaleAujourdhui(control: AbstractControl): ValidationErrors | null {
    const valeur = control.value;
    if (!valeur) return null;
  
    const today = new Date();
    const inputDate = new Date(valeur);
  
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
  
    return inputDate <= today ? null : { dateInvalide: true };
  }
  

  ngOnInit(): void {
    const storedClients = localStorage.getItem('clients');
    if (storedClients) {
      this.clients = JSON.parse(storedClients);
    }
  
    this.produitsList = [
      { _id: 'prod1', nom: 'Produit A', prix: 100 },
      { _id: 'prod2', nom: 'Produit B', prix: 200 },
      { _id: 'prod3', nom: 'Produit C', prix: 150 }
    ];
  
    this.devisForm.get('echeance')?.setValidators([
      Validators.required,
      this.dateInférieureOuÉgaleAujourdhui
    ]);
  
    this.addProduit();
  }
  

  get produitsArray() {
    return this.devisForm.get('produits') as FormArray;
  }

  addProduit() {
    const produitForm = this.fb.group({
      produitId: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]]
    });
    this.produitsArray.push(produitForm);
  }

  removeProduit(index: number) {
    this.produitsArray.removeAt(index);
  }

  calculerTotalHT() {
    let total = 0;
    for (let i = 0; i < this.produitsArray.length; i++) {
      const produitGroup = this.produitsArray.at(i) as FormGroup;
      const produitId = produitGroup.get('produitId')?.value;
      const quantite = produitGroup.get('quantite')?.value || 0;
      
      const produit = this.produitsList.find(p => p._id === produitId);
      if (produit) {
        total += produit.prix * quantite;
      }
    }
    return total;
  }

  calculerMontantTVA() {
    const totalHT = this.calculerTotalHT();
    const tauxTVA = parseFloat(this.devisForm.get('tva')?.value || 0);
    return totalHT * (tauxTVA / 100);
  }

  calculerTotalTTC() {
    return this.calculerTotalHT() + this.calculerMontantTVA();
  }

  onSubmit() {
    if (this.devisForm.valid) {
      const newDevis = {
        ...this.devisForm.value,
        dateEmission: new Date(),
        montantHT: this.calculerTotalHT(),
        montantTVA: this.calculerMontantTVA(),
        montantTTC: this.calculerTotalTTC()
      };

      // Récupérer les devis existants du localStorage
      const existingDevis = JSON.parse(localStorage.getItem('devis') || '[]');
      existingDevis.push(newDevis);
      localStorage.setItem('devis', JSON.stringify(existingDevis));

      this.message = "Devis créé avec succès !";
      this.devisForm.reset({
        statut: 'Brouillon',
        tva: ''
      });
      
      // Réinitialiser les produits
      while (this.produitsArray.length) {
        this.produitsArray.removeAt(0);
      }
      this.addProduit();
    } else {
      this.message = "Veuillez remplir correctement le formulaire.";
    }
  }
}
