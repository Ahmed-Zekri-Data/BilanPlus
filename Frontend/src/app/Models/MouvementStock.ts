import { Produit } from './Produit';


export interface MouvementStock {
  _id?: string;
  produit: string | Produit; // Can be ID (string) or full Produit object
  type: string;
  quantite: number;
  date: Date | string;
}