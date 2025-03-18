import { CompteComptable } from './CompteComptable';

export interface EcritureComptable {
  _id?: string;
  compte: CompteComptable | string;
  montant: number;
  nature: string;
  date?: Date;
}
