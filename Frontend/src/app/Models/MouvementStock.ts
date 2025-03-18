import { Produit } from './Produit';

export interface MouvementStock {
  _id?: string;
  produit: Produit | string;
  type: string;
  quantite: number;
  date?: Date;
}
