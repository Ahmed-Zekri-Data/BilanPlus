import { Client } from './Client';
import { Produit } from './Produit';
import { TVA } from './TVA';

export interface Facture {
  _id?: string;
  reference: string;
  montant: number;
  dateEmission: Date; // Ajouté pour correspondre au backend
  statut: 'Brouillon' | 'Validée' | 'Payée' | 'Paiement Partiel' | 'En retard';
  echeance: Date;
  client: Client | string;
  produits: (Produit | string)[];
  tva: TVA | string;
}