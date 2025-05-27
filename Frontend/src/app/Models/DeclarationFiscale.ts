export interface DeclarationFiscale {
  _id?: string;
  periode: string;
  montantTotal: number;
  statut: string;
  compteComptable: any; // Peut être un ID (string) ou un objet après populate
  type?: string;
  totalTVACollectee: number;
  totalTVADeductible: number;
  totalTVADue: number;
  totalTCL?: number;
  totalDroitTimbre?: number;
  dateCreation?: string;
  penalites?: {
    estEnRetard: boolean;
    retardJours: number;
    tauxPenalite: number;
    montantPenalite: number;
  };
}