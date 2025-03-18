import { Client } from './Client';
import { Produit } from './Produit';
import { TVA } from './TVA';

export interface Facture {
  _id?: string;
  montant: number;
  statut: string;
  echeance: Date;
  client: Client | string;
  produits: (Produit | string)[];
  tva: TVA | string;
}
