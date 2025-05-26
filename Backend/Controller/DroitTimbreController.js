// Backend/Controller/DroitTimbreController.js
const DroitTimbreService = require('../Services/DroitTimbreService');

exports.calculerDroitTimbreFacture = async (req, res) => {
  try {
    const { factureId } = req.params;
    const { valeurTimbre } = req.body;
    
    if (!factureId) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID de la facture est requis'
      });
    }
    
    const resultat = await DroitTimbreService.calculerDroitTimbreFacture(factureId, valeurTimbre);
    
    return res.status(200).json({
      success: true,
      data: resultat
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.calculerDroitTimbrePeriode = async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.body;
    
    if (!dateDebut || !dateFin) {
      return res.status(400).json({
        success: false,
        message: 'Les dates de début et de fin sont requises'
      });
    }
    
    const resultat = await DroitTimbreService.calculerDroitTimbrePeriode(new Date(dateDebut), new Date(dateFin));
    
    return res.status(200).json({
      success: true,
      data: resultat
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.genererRapportDroitTimbre = async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.body;
    
    if (!dateDebut || !dateFin) {
      return res.status(400).json({
        success: false,
        message: 'Les dates de début et de fin sont requises'
      });
    }
    
    const rapport = await DroitTimbreService.genererRapportDroitTimbre(new Date(dateDebut), new Date(dateFin));
    
    return res.status(200).json({
      success: true,
      data: rapport
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
