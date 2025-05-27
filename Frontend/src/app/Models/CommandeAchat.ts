export interface CommandeAchat {
  _id?: string;
  produit: string; // ID du produit
  quantite: number;
  date?: Date;
  type_livraison?: string;
  createdAt?: Date;
  date_fin?: Date | null;
}