// Backend/Controller/DashboardFiscalController.js
const DashboardFiscalService = require('../Services/DashboardFiscalService');
const SimulationFiscaleService = require('../Services/SimulationFiscaleService');

exports.getDashboardFiscal = async (req, res) => {
  try {
    const { annee } = req.params;

    if (!annee) {
      return res.status(400).json({
        success: false,
        message: 'L\'année est requise'
      });
    }

    // Récupérer le tableau de bord pour l'année demandée
    const dashboard = await DashboardFiscalService.genererDashboardFiscal(parseInt(annee));

    // Si aucune donnée n'est disponible pour cette année
    if (!dashboard.dataAvailable) {
      return res.status(200).json({
        success: true,
        data: {
          annee: parseInt(annee),
          dataAvailable: false,
          anneesDisponibles: dashboard.anneesDisponibles,
          message: `Aucune donnée fiscale disponible pour l'année ${annee}`
        }
      });
    }

    // Sinon, renvoyer les données du tableau de bord
    return res.status(200).json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error(`Erreur lors de la génération du tableau de bord pour l'année ${req.params.annee}:`, error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAvailableYears = async (req, res) => {
  try {
    // Récupérer les années disponibles
    const annees = await DashboardFiscalService.getAnneesDisponibles();

    return res.status(200).json({
      success: true,
      data: annees
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des années disponibles:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.simulerChangementVolumeActivite = async (req, res) => {
  try {
    const parametres = req.body;

    // Vérifier les paramètres requis
    const champsRequis = ['chiffreAffairesActuel', 'tauxCroissance', 'tauxTVAMoyen', 'tauxTVADeductibleMoyen', 'proportionAchats'];

    for (const champ of champsRequis) {
      if (parametres[champ] === undefined) {
        return res.status(400).json({
          success: false,
          message: `Le champ ${champ} est requis`
        });
      }
    }

    const resultatSimulation = SimulationFiscaleService.simulerChangementVolumeActivite(parametres);

    return res.status(200).json({
      success: true,
      data: resultatSimulation
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.simulerChangementRegimeImposition = async (req, res) => {
  try {
    const parametres = req.body;

    // Vérifier les paramètres requis
    const champsRequis = ['chiffreAffaires', 'regimeActuel', 'regimeCible', 'beneficeNet', 'tauxTVAMoyen', 'proportionAchats'];

    for (const champ of champsRequis) {
      if (parametres[champ] === undefined) {
        return res.status(400).json({
          success: false,
          message: `Le champ ${champ} est requis`
        });
      }
    }

    // Vérifier les valeurs des régimes
    const regimesValides = ['reel', 'forfaitaire', 'micro'];
    if (!regimesValides.includes(parametres.regimeActuel) || !regimesValides.includes(parametres.regimeCible)) {
      return res.status(400).json({
        success: false,
        message: 'Les régimes doivent être: reel, forfaitaire ou micro'
      });
    }

    const resultatSimulation = SimulationFiscaleService.simulerChangementRegimeImposition(parametres);

    return res.status(200).json({
      success: true,
      data: resultatSimulation
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.simulerImpactInvestissement = async (req, res) => {
  try {
    const parametres = req.body;

    // Vérifier les paramètres requis
    const champsRequis = [
      'montantInvestissement',
      'dureeAmortissement',
      'tauxInteretEmprunt',
      'pourcentageEmprunt',
      'augmentationCAAttendue',
      'tauxIS',
      'tauxTVA'
    ];

    for (const champ of champsRequis) {
      if (parametres[champ] === undefined) {
        return res.status(400).json({
          success: false,
          message: `Le champ ${champ} est requis`
        });
      }
    }

    const resultatSimulation = SimulationFiscaleService.simulerImpactInvestissement(parametres);

    return res.status(200).json({
      success: true,
      data: resultatSimulation
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
