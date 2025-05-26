import { CompteComptable } from './CompteComptable';

export interface LigneEcriture {
  compte: any;
  montant: number;
  nature: 'débit' | 'crédit';
  _id?: string;
}

export interface EcritureComptable {
  _id?: string;
  libelle: string;
  lignes: LigneEcriture[];
  date?: Date;
  createdAt?: string;
  updatedAt?: string;
}
