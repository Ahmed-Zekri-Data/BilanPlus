const CompteComptable = require("../Models/CompteComptable");
const EcritureComptable = require("../Models/EcritureComptable");

// Calculer le tableau de flux de trésorerie
const getCashFlowStatement = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Les dates de début et de fin sont requises"
      });
    }

    const debut = new Date(startDate);
    const fin = new Date(endDate);

    // Récupérer toutes les écritures de la période
    const ecritures = await EcritureComptable.find({
      date: { $gte: debut, $lte: fin }
    }).populate("lignes.compte");

    console.log(`Cash Flow - Nombre d'écritures trouvées: ${ecritures.length}`);
    console.log(`Cash Flow - Période: ${debut} à ${fin}`);

    // Récupérer tous les comptes pour classification
    const comptes = await CompteComptable.find();
    const comptesMap = {};
    comptes.forEach(compte => {
      comptesMap[compte._id] = compte;
    });

    // Initialiser les données de flux de trésorerie
    let operatingActivities = {
      netIncome: 0,
      depreciation: 0,
      accountsReceivableChange: 0,
      accountsPayableChange: 0,
      inventoryChange: 0,
      total: 0
    };

    let investingActivities = {
      equipmentPurchases: 0,
      equipmentSales: 0,
      investments: 0,
      total: 0
    };

    let financingActivities = {
      loanProceeds: 0,
      loanRepayments: 0,
      dividendsPaid: 0,
      capitalContributions: 0,
      total: 0
    };

    // Calculer le résultat net (produits - charges)
    let totalProduits = 0;
    let totalCharges = 0;

    ecritures.forEach(ecriture => {
      ecriture.lignes.forEach(ligne => {
        const compte = ligne.compte;
        if (compte.type === 'produit') {
          if (ligne.nature === 'crédit') {
            totalProduits += ligne.montant;
          } else {
            totalProduits -= ligne.montant;
          }
        } else if (compte.type === 'charge') {
          if (ligne.nature === 'débit') {
            totalCharges += ligne.montant;
          } else {
            totalCharges -= ligne.montant;
          }
        }
      });
    });

    operatingActivities.netIncome = totalProduits - totalCharges;

    console.log(`Cash Flow - Total Produits: ${totalProduits}, Total Charges: ${totalCharges}`);
    console.log(`Cash Flow - Résultat Net: ${operatingActivities.netIncome}`);

    // Calculer les variations des comptes de bilan
    // Pour simplifier, on utilise des estimations basées sur les types de comptes
    ecritures.forEach(ecriture => {
      ecriture.lignes.forEach(ligne => {
        const compte = ligne.compte;
        const montant = ligne.nature === 'débit' ? ligne.montant : -ligne.montant;

        // Classification basée sur le numéro de compte (plan comptable français)
        const numeroCompte = compte.numeroCompte;

        if (numeroCompte.startsWith('2')) {
          // Immobilisations
          if (montant > 0) {
            investingActivities.equipmentPurchases += Math.abs(montant);
          } else {
            investingActivities.equipmentSales += Math.abs(montant);
          }
        } else if (numeroCompte.startsWith('16') || numeroCompte.startsWith('17')) {
          // Emprunts et dettes financières
          if (montant > 0) {
            financingActivities.loanRepayments += Math.abs(montant);
          } else {
            financingActivities.loanProceeds += Math.abs(montant);
          }
        } else if (numeroCompte.startsWith('10') || numeroCompte.startsWith('11')) {
          // Capital et réserves
          if (montant < 0) {
            financingActivities.capitalContributions += Math.abs(montant);
          }
        } else if (numeroCompte.startsWith('41')) {
          // Clients
          operatingActivities.accountsReceivableChange += montant;
        } else if (numeroCompte.startsWith('40')) {
          // Fournisseurs
          operatingActivities.accountsPayableChange -= montant;
        } else if (numeroCompte.startsWith('3')) {
          // Stocks
          operatingActivities.inventoryChange += montant;
        }
      });
    });

    // Estimation de l'amortissement (simplifié)
    operatingActivities.depreciation = totalCharges * 0.1; // 10% estimation

    // Calculer les totaux
    operatingActivities.total = operatingActivities.netIncome +
                               operatingActivities.depreciation +
                               operatingActivities.accountsReceivableChange +
                               operatingActivities.accountsPayableChange +
                               operatingActivities.inventoryChange;

    investingActivities.total = investingActivities.equipmentSales -
                               investingActivities.equipmentPurchases -
                               investingActivities.investments;

    financingActivities.total = financingActivities.loanProceeds +
                               financingActivities.capitalContributions -
                               financingActivities.loanRepayments -
                               financingActivities.dividendsPaid;

    const netCashFlow = operatingActivities.total + investingActivities.total + financingActivities.total;

    // Calculer la trésorerie de début (simplifié)
    const beginningCash = 50000; // Valeur par défaut, à adapter selon vos besoins
    const endingCash = beginningCash + netCashFlow;

    const cashFlowData = {
      operatingActivities,
      investingActivities,
      financingActivities,
      netCashFlow,
      beginningCash,
      endingCash,
      period: {
        startDate: debut,
        endDate: fin
      }
    };

    res.status(200).json(cashFlowData);

  } catch (error) {
    console.error('Erreur lors du calcul du flux de trésorerie:', error);
    res.status(500).json({
      message: "Erreur lors du calcul du flux de trésorerie",
      error: error.message
    });
  }
};

// Calculer les ratios financiers
const getFinancialRatios = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Les dates de début et de fin sont requises"
      });
    }

    const debut = new Date(startDate);
    const fin = new Date(endDate);

    // Récupérer toutes les écritures de la période
    const ecritures = await EcritureComptable.find({
      date: { $gte: debut, $lte: fin }
    }).populate("lignes.compte");

    console.log(`Ratios - Nombre d'écritures trouvées: ${ecritures.length}`);
    console.log(`Ratios - Période: ${debut} à ${fin}`);

    // Calculer les soldes par type de compte
    let actifCirculant = 0;
    let actifTotal = 0;
    let passifCirculant = 0;
    let passifTotal = 0;
    let capitauxPropres = 0;
    let chiffreAffaires = 0;
    let resultatNet = 0;
    let charges = 0;
    let stocks = 0;
    let creances = 0;
    let dettes = 0;
    let tresorerie = 0;

    ecritures.forEach(ecriture => {
      ecriture.lignes.forEach(ligne => {
        const compte = ligne.compte;
        const numeroCompte = compte.numeroCompte;
        const montant = ligne.nature === 'débit' ? ligne.montant : -ligne.montant;

        // Classification selon le plan comptable français
        if (numeroCompte.startsWith('2')) {
          // Immobilisations (actif non circulant)
          actifTotal += Math.abs(montant);
        } else if (numeroCompte.startsWith('3') || numeroCompte.startsWith('41') || numeroCompte.startsWith('5')) {
          // Actif circulant
          if (montant > 0) { // Seulement les débits pour l'actif
            actifCirculant += montant;
            actifTotal += montant;

            if (numeroCompte.startsWith('3')) {
              stocks += montant;
            } else if (numeroCompte.startsWith('41')) {
              creances += montant;
            } else if (numeroCompte.startsWith('5')) {
              tresorerie += montant;
            }
          }
        } else if (numeroCompte.startsWith('40') || numeroCompte.startsWith('42') || numeroCompte.startsWith('43')) {
          // Passif circulant
          if (montant < 0) { // Seulement les crédits pour le passif
            passifCirculant += Math.abs(montant);
            passifTotal += Math.abs(montant);

            if (numeroCompte.startsWith('40')) {
              dettes += Math.abs(montant);
            }
          }
        } else if (numeroCompte.startsWith('1')) {
          // Capitaux propres et dettes long terme
          if (numeroCompte.startsWith('10') || numeroCompte.startsWith('11') || numeroCompte.startsWith('12')) {
            if (montant < 0) { // Crédits pour capitaux propres
              capitauxPropres += Math.abs(montant);
            }
          } else {
            if (montant < 0) { // Crédits pour dettes long terme
              passifTotal += Math.abs(montant);
            }
          }
        } else if (compte.type === 'produit') {
          if (ligne.nature === 'crédit') {
            chiffreAffaires += ligne.montant;
            resultatNet += ligne.montant;
          } else {
            resultatNet -= ligne.montant;
          }
        } else if (compte.type === 'charge') {
          if (ligne.nature === 'débit') {
            charges += ligne.montant;
            resultatNet -= ligne.montant;
          } else {
            resultatNet += ligne.montant;
          }
        }
      });
    });

    console.log(`Ratios - Actif Total: ${actifTotal}, Passif Total: ${passifTotal}`);
    console.log(`Ratios - Capitaux Propres: ${capitauxPropres}, CA: ${chiffreAffaires}`);
    console.log(`Ratios - Résultat Net: ${resultatNet}, Charges: ${charges}`);

    // Calculer les ratios
    const ratios = {
      liquidity: {
        currentRatio: passifCirculant > 0 ? actifCirculant / passifCirculant : 0,
        quickRatio: passifCirculant > 0 ? (actifCirculant - stocks) / passifCirculant : 0,
        cashRatio: passifCirculant > 0 ? tresorerie / passifCirculant : 0,
        workingCapital: actifCirculant - passifCirculant
      },
      profitability: {
        grossProfitMargin: chiffreAffaires > 0 ? ((chiffreAffaires - charges * 0.6) / chiffreAffaires) * 100 : 0,
        netProfitMargin: chiffreAffaires > 0 ? (resultatNet / chiffreAffaires) * 100 : 0,
        returnOnAssets: actifTotal > 0 ? (resultatNet / actifTotal) * 100 : 0,
        returnOnEquity: capitauxPropres > 0 ? (resultatNet / capitauxPropres) * 100 : 0
      },
      solvency: {
        debtToEquity: capitauxPropres > 0 ? passifTotal / capitauxPropres : 0,
        debtToAssets: actifTotal > 0 ? passifTotal / actifTotal : 0,
        equityRatio: actifTotal > 0 ? capitauxPropres / actifTotal : 0,
        interestCoverage: charges > 0 ? resultatNet / (charges * 0.05) : 0 // 5% estimation des charges financières
      },
      efficiency: {
        assetTurnover: actifTotal > 0 ? chiffreAffaires / actifTotal : 0,
        inventoryTurnover: stocks > 0 ? (charges * 0.6) / stocks : 0, // 60% estimation du coût des ventes
        receivablesTurnover: creances > 0 ? chiffreAffaires / creances : 0,
        payablesTurnover: dettes > 0 ? (charges * 0.6) / dettes : 0
      },
      period: {
        startDate: debut,
        endDate: fin
      }
    };

    res.status(200).json(ratios);

  } catch (error) {
    console.error('Erreur lors du calcul des ratios financiers:', error);
    res.status(500).json({
      message: "Erreur lors du calcul des ratios financiers",
      error: error.message
    });
  }
};

// Calculer les rapports comparatifs
const getComparativeReport = async (req, res) => {
  try {
    const { type, currentStartDate, currentEndDate } = req.query;

    if (!type || !currentStartDate || !currentEndDate) {
      return res.status(400).json({
        message: "Le type de comparaison et les dates sont requis"
      });
    }

    const currentStart = new Date(currentStartDate);
    const currentEnd = new Date(currentEndDate);

    // Calculer les dates de la période précédente selon le type
    let previousStart, previousEnd;

    switch (type) {
      case 'year-over-year':
        previousStart = new Date(currentStart.getFullYear() - 1, currentStart.getMonth(), currentStart.getDate());
        previousEnd = new Date(currentEnd.getFullYear() - 1, currentEnd.getMonth(), currentEnd.getDate());
        break;
      case 'month-over-month':
        previousStart = new Date(currentStart.getFullYear(), currentStart.getMonth() - 1, currentStart.getDate());
        previousEnd = new Date(currentEnd.getFullYear(), currentEnd.getMonth() - 1, currentEnd.getDate());
        break;
      case 'quarter-over-quarter':
        previousStart = new Date(currentStart.getFullYear(), currentStart.getMonth() - 3, currentStart.getDate());
        previousEnd = new Date(currentEnd.getFullYear(), currentEnd.getMonth() - 3, currentEnd.getDate());
        break;
      default:
        return res.status(400).json({
          message: "Type de comparaison non valide"
        });
    }

    console.log(`Comparative Report - Type: ${type}`);
    console.log(`Comparative Report - Période actuelle: ${currentStart} à ${currentEnd}`);
    console.log(`Comparative Report - Période précédente: ${previousStart} à ${previousEnd}`);

    // Récupérer les données pour les deux périodes
    const [currentData, previousData] = await Promise.all([
      getFinancialDataForPeriod(currentStart, currentEnd),
      getFinancialDataForPeriod(previousStart, previousEnd)
    ]);

    // Calculer les variances et tendances
    const compareMetrics = (current, previous) => {
      const variance = {
        absolute: current - previous,
        percentage: previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : 0
      };

      let trend = 'stable';
      if (Math.abs(variance.percentage) > 5) {
        trend = variance.percentage > 0 ? 'increasing' : 'decreasing';
      }

      return {
        current,
        previous,
        variance,
        trend
      };
    };

    const comparativeReport = {
      type,
      revenue: compareMetrics(currentData.revenue, previousData.revenue),
      expenses: compareMetrics(currentData.expenses, previousData.expenses),
      netIncome: compareMetrics(currentData.netIncome, previousData.netIncome),
      assets: compareMetrics(currentData.assets, previousData.assets),
      liabilities: compareMetrics(currentData.liabilities, previousData.liabilities),
      equity: compareMetrics(currentData.equity, previousData.equity),
      cashFlow: compareMetrics(currentData.cashFlow, previousData.cashFlow),
      periods: {
        current: {
          startDate: currentStart,
          endDate: currentEnd,
          label: formatPeriodLabel(currentStart, currentEnd, type)
        },
        previous: {
          startDate: previousStart,
          endDate: previousEnd,
          label: formatPeriodLabel(previousStart, previousEnd, type)
        }
      }
    };

    res.status(200).json(comparativeReport);

  } catch (error) {
    console.error('Erreur lors de la génération du rapport comparatif:', error);
    res.status(500).json({
      message: "Erreur lors de la génération du rapport comparatif",
      error: error.message
    });
  }
};

// Fonction helper pour récupérer les données financières d'une période
const getFinancialDataForPeriod = async (startDate, endDate) => {
  const ecritures = await EcritureComptable.find({
    date: { $gte: startDate, $lte: endDate }
  }).populate("lignes.compte");

  let revenue = 0;
  let expenses = 0;
  let assets = 0;
  let liabilities = 0;
  let equity = 0;
  let cashFlow = 0;

  ecritures.forEach(ecriture => {
    ecriture.lignes.forEach(ligne => {
      const compte = ligne.compte;
      const numeroCompte = compte.numeroCompte;
      const montant = ligne.montant;

      // Classification selon le plan comptable français
      if (compte.type === 'produit') {
        if (ligne.nature === 'crédit') {
          revenue += montant;
        } else {
          revenue -= montant;
        }
      } else if (compte.type === 'charge') {
        if (ligne.nature === 'débit') {
          expenses += montant;
        } else {
          expenses -= montant;
        }
      }

      // Classification pour le bilan
      if (numeroCompte.startsWith('2') || numeroCompte.startsWith('3') ||
          numeroCompte.startsWith('41') || numeroCompte.startsWith('5')) {
        // Actif
        if (ligne.nature === 'débit') {
          assets += montant;
        } else {
          assets -= montant;
        }
      } else if (numeroCompte.startsWith('40') || numeroCompte.startsWith('42') ||
                 numeroCompte.startsWith('43') || numeroCompte.startsWith('16') ||
                 numeroCompte.startsWith('17')) {
        // Passif (dettes)
        if (ligne.nature === 'crédit') {
          liabilities += montant;
        } else {
          liabilities -= montant;
        }
      } else if (numeroCompte.startsWith('10') || numeroCompte.startsWith('11') ||
                 numeroCompte.startsWith('12')) {
        // Capitaux propres
        if (ligne.nature === 'crédit') {
          equity += montant;
        } else {
          equity -= montant;
        }
      }

      // Flux de trésorerie (comptes de classe 5)
      if (numeroCompte.startsWith('5')) {
        if (ligne.nature === 'débit') {
          cashFlow += montant;
        } else {
          cashFlow -= montant;
        }
      }
    });
  });

  return {
    revenue,
    expenses,
    netIncome: revenue - expenses,
    assets: Math.abs(assets),
    liabilities: Math.abs(liabilities),
    equity: Math.abs(equity),
    cashFlow
  };
};

// Fonction helper pour formater les labels de période
const formatPeriodLabel = (startDate, endDate, type) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };

  switch (type) {
    case 'year-over-year':
      return `Année ${startDate.getFullYear()}`;
    case 'month-over-month':
      return startDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
    case 'quarter-over-quarter':
      const quarter = Math.floor(startDate.getMonth() / 3) + 1;
      return `T${quarter} ${startDate.getFullYear()}`;
    default:
      return `${startDate.toLocaleDateString('fr-FR', options)} - ${endDate.toLocaleDateString('fr-FR', options)}`;
  }
};

module.exports = {
  getCashFlowStatement,
  getFinancialRatios,
  getComparativeReport
};
