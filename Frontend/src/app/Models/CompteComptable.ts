export interface CompteComptable {
  _id?: string;
  numeroCompte: string; // Ajouté, obligatoire dans le backend
  nom: string;
  type: 'actif' | 'passif' | 'charge' | 'produit'; // Typage précis
  solde: number;
  createdAt?: string; // Optionnel, retourné par le backend
  updatedAt?: string; // Optionnel, retourné par le backend
}