import { DeclarationFiscale } from './DeclarationFiscale'

export interface TVA {
  _id?: string;
  taux: number; // Taux de TVA (ex. 19%)
  montant: number; // Montant total de la TVA
  declaration?: string | DeclarationFiscale; // Référence à une déclaration fiscale (ID ou objet)
}