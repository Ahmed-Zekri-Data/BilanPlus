import { Facture } from './Facture';

export interface Paiement {
  _id?: string;
  montant: number;
  date?: Date;
  facture: Facture | string;
  modePaiement: string;
}
