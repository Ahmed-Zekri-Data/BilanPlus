import { Produit } from './Produit';

export interface CommandeAchat {
  _id?: string;
  produit: Produit | string;
  quantite: number;
  prixTotal: number;
  statut: string;
}
