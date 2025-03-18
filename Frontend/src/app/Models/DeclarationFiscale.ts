import { CompteComptable } from './CompteComptable';

export interface DeclarationFiscale {
  _id?: string;
  periode: string;
  montantTotal: number;
  statut: string;
  compteComptable: CompteComptable | string;
}
