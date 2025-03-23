import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Fournisseur } from 'src/app/Models/Fournisseur';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-fournisseurs',
  templateUrl: './fournisseurs.component.html',
  styleUrls: ['./fournisseurs.component.css']
})
export class FournisseursComponent implements OnInit {
  fournisseurs: Fournisseur[] = [];
  fournisseurForm: FormGroup;
  showForm = false;

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.fournisseurForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      adresse: ['', Validators.required],
      categorie: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadFournisseurs();
  }
  toggleForm(): void {
    this.showForm = !this.showForm;
  }
  
  loadFournisseurs(): void {
    this.apiService.getFournisseurs().subscribe({
      next: (data: Fournisseur[]) => {
        this.fournisseurs = data;
        console.log('Fournisseurs chargés :', this.fournisseurs);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des fournisseurs:', err);
      }
    });
  }

  deleteFournisseur(_id: string): void {
    if (confirm('Voulez-vous vraiment supprimer ce fournisseur ?')) {
      this.apiService.deleteFournisseur(_id).subscribe({
        next: () => {
          this.fournisseurs = this.fournisseurs.filter(f => f._id !== _id);
          console.log('Fournisseur supprimé avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
        }
      });
    }
  }

  addFournisseur(): void {
    if (this.fournisseurForm.valid) {
      const newFournisseur: Fournisseur = this.fournisseurForm.value;
      console.log('Envoi du nouveau fournisseur:', newFournisseur);
      
      this.apiService.addFournisseur(newFournisseur).subscribe({
        next: (fournisseur: Fournisseur) => {
          console.log('Réponse du serveur:', fournisseur);
          
          // Vérifier que l'ID est bien présent
          if (fournisseur && fournisseur._id) {
            this.fournisseurs.push(fournisseur);
            this.fournisseurForm.reset();
            this.showForm = false;
            console.log('Fournisseur ajouté avec succès :', fournisseur);
            // Optionnel: message de succès pour l'utilisateur
            alert('Fournisseur ajouté avec succès!');
          } else {
            console.error('Erreur: Le serveur n\'a pas retourné un ID pour le fournisseur');
            alert('Erreur lors de l\'ajout du fournisseur: ID manquant');
          }
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout du fournisseur :', err);
          alert('Erreur lors de l\'ajout du fournisseur: ' + (err.message || 'Erreur inconnue'));
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.fournisseurForm.controls).forEach(key => {
        this.fournisseurForm.get(key)?.markAsTouched();
      });
      console.warn('Formulaire invalide. Veuillez corriger les erreurs.');
    }
  }
}