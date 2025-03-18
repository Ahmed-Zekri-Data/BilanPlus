import { DeclarationFiscale } from './DeclarationFiscale'

export interface TVA {
  _id?: string;
  taux: number;
  montant: number;
  declaration: DeclarationFiscale | string;
}
