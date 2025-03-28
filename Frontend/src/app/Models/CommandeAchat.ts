export interface CommandeAchat {
  _id?: string;
  produit: string; // ID du produit
  quantite: number;
  prix: number;
  statut?: string; // Optionnel, comme dans le backend
  fournisseurID: string; // ID du fournisseur
}