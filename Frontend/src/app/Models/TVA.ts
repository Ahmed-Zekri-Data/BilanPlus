import { DeclarationFiscale } from './DeclarationFiscale'

export interface TVA {
  _id?: string;
  taux: number; // Taux de TVA (ex. 19%)
  montant: number; // Montant total de la TVA
  declarations?: (string | DeclarationFiscale)[] | null; // Références à des déclarations fiscales (IDs ou objets), peut être null
  dateCreation?: Date | string; // Date de création de la TVA
}