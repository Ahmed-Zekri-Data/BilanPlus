import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CashFlowData {
  operatingActivities: {
    netIncome: number;
    depreciation: number;
    accountsReceivableChange: number;
    accountsPayableChange: number;
    inventoryChange: number;
    total: number;
  };
  investingActivities: {
    equipmentPurchases: number;
    equipmentSales: number;
    investments: number;
    total: number;
  };
  financingActivities: {
    loanProceeds: number;
    loanRepayments: number;
    dividendsPaid: number;
    capitalContributions: number;
    total: number;
  };
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface FinancialRatios {
  liquidity: {
    currentRatio: number;
    quickRatio: number;
    cashRatio: number;
    workingCapital: number;
  };
  profitability: {
    grossProfitMargin: number;
    netProfitMargin: number;
    returnOnAssets: number;
    returnOnEquity: number;
  };
  solvency: {
    debtToEquity: number;
    debtToAssets: number;
    equityRatio: number;
    interestCoverage: number;
  };
  efficiency: {
    assetTurnover: number;
    inventoryTurnover: number;
    receivablesTurnover: number;
    payablesTurnover: number;
  };
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface ComparativeData {
  current: number;
  previous: number;
  variance: {
    absolute: number;
    percentage: number;
  };
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface ComparativeReport {
  type: 'year-over-year' | 'month-over-month' | 'quarter-over-quarter';
  revenue: ComparativeData;
  expenses: ComparativeData;
  netIncome: ComparativeData;
  assets: ComparativeData;
  liabilities: ComparativeData;
  equity: ComparativeData;
  cashFlow: ComparativeData;
  periods: {
    current: { startDate: Date; endDate: Date; label: string };
    previous: { startDate: Date; endDate: Date; label: string };
  };
}

export interface EnhancedGrandLivreFilter {
  compteIds?: string[];
  dateDebut?: Date;
  dateFin?: Date;
  typeCompte?: string;
  soldeMinimum?: number;
  soldeMaximum?: number;
  includeZeroBalance?: boolean;
  sortBy?: 'numeroCompte' | 'nom' | 'solde' | 'mouvements';
  sortOrder?: 'asc' | 'desc';
  groupBy?: 'type' | 'category' | 'none';
}

export interface EnhancedJournalFilter {
  dateDebut?: Date;
  dateFin?: Date;
  compteIds?: string[];
  montantMinimum?: number;
  montantMaximum?: number;
  libelle?: string;
  typeEcriture?: string;
  sortBy?: 'date' | 'montant' | 'libelle';
  sortOrder?: 'asc' | 'desc';
  groupBy?: 'date' | 'compte' | 'type' | 'none';
}

@Injectable({
  providedIn: 'root'
})
export class AdvancedReportsService {
  private apiUrl = 'http://localhost:3000/reports';

  constructor(private http: HttpClient) {}

  // Enhanced Grand Livre
  getEnhancedGrandLivre(filters: EnhancedGrandLivreFilter): Observable<any> {
    let params = new HttpParams();

    if (filters.compteIds?.length) {
      params = params.set('compteIds', filters.compteIds.join(','));
    }
    if (filters.dateDebut) {
      params = params.set('dateDebut', filters.dateDebut.toISOString());
    }
    if (filters.dateFin) {
      params = params.set('dateFin', filters.dateFin.toISOString());
    }
    if (filters.typeCompte) {
      params = params.set('typeCompte', filters.typeCompte);
    }
    if (filters.soldeMinimum !== undefined) {
      params = params.set('soldeMinimum', filters.soldeMinimum.toString());
    }
    if (filters.soldeMaximum !== undefined) {
      params = params.set('soldeMaximum', filters.soldeMaximum.toString());
    }
    if (filters.includeZeroBalance !== undefined) {
      params = params.set('includeZeroBalance', filters.includeZeroBalance.toString());
    }
    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
    if (filters.sortOrder) {
      params = params.set('sortOrder', filters.sortOrder);
    }
    if (filters.groupBy) {
      params = params.set('groupBy', filters.groupBy);
    }

    return this.http.get(`${this.apiUrl}/grand-livre-enhanced`, { params });
  }

  // Enhanced Journal
  getEnhancedJournal(filters: EnhancedJournalFilter): Observable<any> {
    let params = new HttpParams();

    if (filters.dateDebut) {
      params = params.set('dateDebut', filters.dateDebut.toISOString());
    }
    if (filters.dateFin) {
      params = params.set('dateFin', filters.dateFin.toISOString());
    }
    if (filters.compteIds?.length) {
      params = params.set('compteIds', filters.compteIds.join(','));
    }
    if (filters.montantMinimum !== undefined) {
      params = params.set('montantMinimum', filters.montantMinimum.toString());
    }
    if (filters.montantMaximum !== undefined) {
      params = params.set('montantMaximum', filters.montantMaximum.toString());
    }
    if (filters.libelle) {
      params = params.set('libelle', filters.libelle);
    }
    if (filters.typeEcriture) {
      params = params.set('typeEcriture', filters.typeEcriture);
    }
    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
    if (filters.sortOrder) {
      params = params.set('sortOrder', filters.sortOrder);
    }
    if (filters.groupBy) {
      params = params.set('groupBy', filters.groupBy);
    }

    return this.http.get(`${this.apiUrl}/journal-enhanced`, { params });
  }

  // Cash Flow Statement
  getCashFlowStatement(startDate: Date, endDate: Date): Observable<CashFlowData> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get<CashFlowData>(`${this.apiUrl}/cash-flow`, { params });
  }

  // Financial Ratios
  getFinancialRatios(startDate: Date, endDate: Date): Observable<FinancialRatios> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get<FinancialRatios>(`${this.apiUrl}/financial-ratios`, { params });
  }

  // Comparative Reports
  getComparativeReport(
    type: 'year-over-year' | 'month-over-month' | 'quarter-over-quarter',
    currentStartDate: Date,
    currentEndDate: Date
  ): Observable<ComparativeReport> {
    const params = new HttpParams()
      .set('type', type)
      .set('currentStartDate', currentStartDate.toISOString())
      .set('currentEndDate', currentEndDate.toISOString());

    return this.http.get<ComparativeReport>(`${this.apiUrl}/comparative`, { params });
  }

  // Export Functions
  exportGrandLivreToExcel(filters: EnhancedGrandLivreFilter): Observable<Blob> {
    let params = new HttpParams();
    // Add filter parameters similar to getEnhancedGrandLivre

    return this.http.get(`${this.apiUrl}/grand-livre-enhanced/export/excel`, {
      params,
      responseType: 'blob'
    });
  }

  exportJournalToExcel(filters: EnhancedJournalFilter): Observable<Blob> {
    let params = new HttpParams();
    // Add filter parameters similar to getEnhancedJournal

    return this.http.get(`${this.apiUrl}/journal-enhanced/export/excel`, {
      params,
      responseType: 'blob'
    });
  }

  exportCashFlowToPDF(startDate: Date, endDate: Date): Observable<Blob> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get(`${this.apiUrl}/cash-flow/export/pdf`, {
      params,
      responseType: 'blob'
    });
  }

  exportFinancialRatiosToPDF(startDate: Date, endDate: Date): Observable<Blob> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get(`${this.apiUrl}/financial-ratios/export/pdf`, {
      params,
      responseType: 'blob'
    });
  }

  exportComparativeReportToPDF(
    type: 'year-over-year' | 'month-over-month' | 'quarter-over-quarter',
    currentStartDate: Date,
    currentEndDate: Date
  ): Observable<Blob> {
    const params = new HttpParams()
      .set('type', type)
      .set('currentStartDate', currentStartDate.toISOString())
      .set('currentEndDate', currentEndDate.toISOString());

    return this.http.get(`${this.apiUrl}/comparative/export/pdf`, {
      params,
      responseType: 'blob'
    });
  }
}
