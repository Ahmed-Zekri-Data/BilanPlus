import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  constructor() { }

  /**
   * Export Balance to PDF using browser print
   */
  exportBalance(balanceData: any, filters: any): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = this.generateBalanceHTML(balanceData, filters);
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Auto print after content loads
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  /**
   * Export Bilan to PDF using browser print
   */
  exportBilan(bilanData: any): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = this.generateBilanHTML(bilanData);
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  /**
   * Export Resultat to PDF using browser print
   */
  exportResultat(resultatData: any): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = this.generateResultatHTML(resultatData);
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  /**
   * Generate HTML for Balance PDF
   */
  private generateBalanceHTML(balanceData: any, filters: any): string {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const dateDebut = filters.dateDebut ? new Date(filters.dateDebut).toLocaleDateString('fr-FR') : 'Non spécifiée';
    const dateFin = filters.dateFin ? new Date(filters.dateFin).toLocaleDateString('fr-FR') : 'Non spécifiée';

    let tableRows = '';
    if (balanceData.balance && balanceData.balance.length > 0) {
      balanceData.balance.forEach((ligne: any) => {
        tableRows += `
          <tr>
            <td>${ligne.compte.numeroCompte}</td>
            <td>${ligne.compte.nom}</td>
            <td class="number">${this.formatCurrency(ligne.soldeInitial)}</td>
            <td class="number">${this.formatCurrency(ligne.mouvementDebit)}</td>
            <td class="number">${this.formatCurrency(ligne.mouvementCredit)}</td>
            <td class="number">${ligne.soldeDebit > 0 ? this.formatCurrency(ligne.soldeDebit) : ''}</td>
            <td class="number">${ligne.soldeCredit > 0 ? this.formatCurrency(ligne.soldeCredit) : ''}</td>
          </tr>
        `;
      });
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Balance Comptable - Bilan+</title>
        <style>
          ${this.getCommonPrintStyles()}
          .balance-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .balance-table th, .balance-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .balance-table th { background-color: #1E3A8A; color: white; font-weight: bold; }
          .number { text-align: right; }
          .totals-row { background-color: #D4AF37; color: white; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Balance Comptable</h1>
          <div class="company-info">
            <p><strong>Bilan+</strong> - Système de Gestion Comptable</p>
            <p>Date d'édition: ${currentDate}</p>
            <p>Période: Du ${dateDebut} au ${dateFin}</p>
          </div>
        </div>

        <table class="balance-table">
          <thead>
            <tr>
              <th>N° Compte</th>
              <th>Nom du Compte</th>
              <th>Solde Initial</th>
              <th>Mouvement Débit</th>
              <th>Mouvement Crédit</th>
              <th>Solde Débiteur</th>
              <th>Solde Créditeur</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
            <tr class="totals-row">
              <td colspan="2"><strong>TOTAUX</strong></td>
              <td class="number"><strong>${this.formatCurrency(balanceData.totaux?.soldeInitial || 0)}</strong></td>
              <td class="number"><strong>${this.formatCurrency(balanceData.totaux?.mouvementDebit || 0)}</strong></td>
              <td class="number"><strong>${this.formatCurrency(balanceData.totaux?.mouvementCredit || 0)}</strong></td>
              <td class="number"><strong>${this.formatCurrency(balanceData.totaux?.soldeDebiteur || 0)}</strong></td>
              <td class="number"><strong>${this.formatCurrency(balanceData.totaux?.soldeCrediteur || 0)}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Document généré automatiquement par Bilan+ le ${currentDate}</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML for Bilan PDF
   */
  private generateBilanHTML(bilanData: any): string {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const bilanDate = new Date(bilanData.date).toLocaleDateString('fr-FR');

    let actifRows = '';
    let passifRows = '';

    // Generate Actif rows
    if (bilanData.actif) {
      Object.keys(bilanData.actif).forEach(category => {
        if (bilanData.actif[category].comptes) {
          actifRows += `<tr class="category-row"><td colspan="2"><strong>${bilanData.actif[category].title}</strong></td></tr>`;
          bilanData.actif[category].comptes.forEach((compte: any) => {
            actifRows += `
              <tr>
                <td>${compte.numeroCompte} - ${compte.nom}</td>
                <td class="number">${this.formatCurrency(compte.solde)}</td>
              </tr>
            `;
          });
          actifRows += `<tr class="subtotal-row"><td><strong>Total ${bilanData.actif[category].title}</strong></td><td class="number"><strong>${this.formatCurrency(bilanData.actif[category].total)}</strong></td></tr>`;
        }
      });
    }

    // Generate Passif rows
    if (bilanData.passif) {
      Object.keys(bilanData.passif).forEach(category => {
        if (bilanData.passif[category].comptes) {
          passifRows += `<tr class="category-row"><td colspan="2"><strong>${bilanData.passif[category].title}</strong></td></tr>`;
          bilanData.passif[category].comptes.forEach((compte: any) => {
            passifRows += `
              <tr>
                <td>${compte.numeroCompte} - ${compte.nom}</td>
                <td class="number">${this.formatCurrency(compte.solde)}</td>
              </tr>
            `;
          });
          passifRows += `<tr class="subtotal-row"><td><strong>Total ${bilanData.passif[category].title}</strong></td><td class="number"><strong>${this.formatCurrency(bilanData.passif[category].total)}</strong></td></tr>`;
        }
      });
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bilan Comptable - Bilan+</title>
        <style>
          ${this.getCommonPrintStyles()}
          .bilan-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .bilan-table th, .bilan-table td { border: 1px solid #ddd; padding: 8px; }
          .bilan-table th { background-color: #1E3A8A; color: white; font-weight: bold; text-align: center; }
          .actif-section, .passif-section { width: 50%; vertical-align: top; }
          .category-row { background-color: #f0f0f0; font-weight: bold; }
          .subtotal-row { background-color: #e0e0e0; font-weight: bold; }
          .total-row { background-color: #D4AF37; color: white; font-weight: bold; }
          .number { text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Bilan Comptable</h1>
          <div class="company-info">
            <p><strong>Bilan+</strong> - Système de Gestion Comptable</p>
            <p>Date d'édition: ${currentDate}</p>
            <p>Bilan au: ${bilanDate}</p>
          </div>
        </div>

        <table class="bilan-table">
          <thead>
            <tr>
              <th class="actif-section">ACTIF</th>
              <th style="width: 15%;">Montant</th>
              <th class="passif-section">PASSIF</th>
              <th style="width: 15%;">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="actif-section">
                <table style="width: 100%; border: none;">
                  ${actifRows}
                </table>
              </td>
              <td></td>
              <td class="passif-section">
                <table style="width: 100%; border: none;">
                  ${passifRows}
                </table>
              </td>
              <td></td>
            </tr>
            <tr class="total-row">
              <td><strong>TOTAL ACTIF</strong></td>
              <td class="number"><strong>${this.formatCurrency(bilanData.totalActif)}</strong></td>
              <td><strong>TOTAL PASSIF</strong></td>
              <td class="number"><strong>${this.formatCurrency(bilanData.totalPassif)}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Document généré automatiquement par Bilan+ le ${currentDate}</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML for Resultat PDF
   */
  private generateResultatHTML(resultatData: any): string {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const dateDebut = new Date(resultatData.periode.debut).toLocaleDateString('fr-FR');
    const dateFin = new Date(resultatData.periode.fin).toLocaleDateString('fr-FR');

    let chargesRows = '';
    let produitsRows = '';

    // Generate Charges rows
    if (resultatData.charges) {
      Object.keys(resultatData.charges).forEach(category => {
        if (resultatData.charges[category].comptes) {
          chargesRows += `<tr class="category-row"><td colspan="2"><strong>${resultatData.charges[category].title}</strong></td></tr>`;
          resultatData.charges[category].comptes.forEach((compte: any) => {
            chargesRows += `
              <tr>
                <td>${compte.numeroCompte} - ${compte.nom}</td>
                <td class="number">${this.formatCurrency(compte.solde)}</td>
              </tr>
            `;
          });
          chargesRows += `<tr class="subtotal-row"><td><strong>Total ${resultatData.charges[category].title}</strong></td><td class="number"><strong>${this.formatCurrency(resultatData.charges[category].total)}</strong></td></tr>`;
        }
      });
    }

    // Generate Produits rows
    if (resultatData.produits) {
      Object.keys(resultatData.produits).forEach(category => {
        if (resultatData.produits[category].comptes) {
          produitsRows += `<tr class="category-row"><td colspan="2"><strong>${resultatData.produits[category].title}</strong></td></tr>`;
          resultatData.produits[category].comptes.forEach((compte: any) => {
            produitsRows += `
              <tr>
                <td>${compte.numeroCompte} - ${compte.nom}</td>
                <td class="number">${this.formatCurrency(compte.solde)}</td>
              </tr>
            `;
          });
          produitsRows += `<tr class="subtotal-row"><td><strong>Total ${resultatData.produits[category].title}</strong></td><td class="number"><strong>${this.formatCurrency(resultatData.produits[category].total)}</strong></td></tr>`;
        }
      });
    }

    const resultatClass = resultatData.resultatNet >= 0 ? 'profit' : 'loss';
    const resultatLabel = resultatData.resultatNet >= 0 ? 'BÉNÉFICE' : 'PERTE';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Compte de Résultat - Bilan+</title>
        <style>
          ${this.getCommonPrintStyles()}
          .resultat-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .resultat-table th, .resultat-table td { border: 1px solid #ddd; padding: 8px; }
          .resultat-table th { background-color: #1E3A8A; color: white; font-weight: bold; text-align: center; }
          .charges-section, .produits-section { width: 50%; vertical-align: top; }
          .category-row { background-color: #f0f0f0; font-weight: bold; }
          .subtotal-row { background-color: #e0e0e0; font-weight: bold; }
          .total-row { background-color: #D4AF37; color: white; font-weight: bold; }
          .resultat-row.profit { background-color: #4caf50; color: white; }
          .resultat-row.loss { background-color: #f44336; color: white; }
          .number { text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Compte de Résultat</h1>
          <div class="company-info">
            <p><strong>Bilan+</strong> - Système de Gestion Comptable</p>
            <p>Date d'édition: ${currentDate}</p>
            <p>Période: Du ${dateDebut} au ${dateFin}</p>
          </div>
        </div>

        <table class="resultat-table">
          <thead>
            <tr>
              <th class="charges-section">CHARGES</th>
              <th style="width: 15%;">Montant</th>
              <th class="produits-section">PRODUITS</th>
              <th style="width: 15%;">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="charges-section">
                <table style="width: 100%; border: none;">
                  ${chargesRows}
                </table>
              </td>
              <td></td>
              <td class="produits-section">
                <table style="width: 100%; border: none;">
                  ${produitsRows}
                </table>
              </td>
              <td></td>
            </tr>
            <tr class="total-row">
              <td><strong>TOTAL CHARGES</strong></td>
              <td class="number"><strong>${this.formatCurrency(resultatData.totalCharges)}</strong></td>
              <td><strong>TOTAL PRODUITS</strong></td>
              <td class="number"><strong>${this.formatCurrency(resultatData.totalProduits)}</strong></td>
            </tr>
            <tr class="resultat-row ${resultatClass}">
              <td colspan="3"><strong>RÉSULTAT NET (${resultatLabel})</strong></td>
              <td class="number"><strong>${this.formatCurrency(Math.abs(resultatData.resultatNet))}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Document généré automatiquement par Bilan+ le ${currentDate}</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Common print styles for all PDF exports
   */
  private getCommonPrintStyles(): string {
    return `
      @media print {
        @page { margin: 1cm; size: A4; }
        body { margin: 0; }
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #333;
        margin: 20px;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #1E3A8A;
        padding-bottom: 20px;
      }
      
      .header h1 {
        color: #1E3A8A;
        font-size: 24px;
        margin: 0 0 15px 0;
        font-weight: bold;
      }
      
      .company-info {
        color: #666;
        font-size: 11px;
      }
      
      .company-info p {
        margin: 5px 0;
      }
      
      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 10px;
        color: #666;
        border-top: 1px solid #ddd;
        padding-top: 15px;
      }
      
      table {
        font-size: 11px;
      }
      
      .number {
        font-family: 'Courier New', monospace;
      }
    `;
  }

  /**
   * Format currency for display
   */
  private formatCurrency(amount: number): string {
    if (amount === null || amount === undefined) return '0,00 TND';
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}
