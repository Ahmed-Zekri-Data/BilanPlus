// Backend/Controller/TCLController.js
const TCLService = require('../Services/TCLService');

exports.calculerTCL = async (req, res) => {
  try {
    const { dateDebut, dateFin, tauxTCL } = req.body;
    
    if (!dateDebut || !dateFin) {
      return res.status(400).json({
        success: false,
        message: 'Les dates de début et de fin sont requises'
      });
    }
    
    // Utiliser le taux fourni ou la valeur par défaut (0.2%)
    const taux = tauxTCL || 0.2;
    
    const resultatTCL = await TCLService.calculerTCL(new Date(dateDebut), new Date(dateFin), taux);
    
    return res.status(200).json({
      success: true,
      data: resultatTCL
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.calculerTCLParCommune = async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.body;
    
    if (!dateDebut || !dateFin) {
      return res.status(400).json({
        success: false,
        message: 'Les dates de début et de fin sont requises'
      });
    }
    
    const resultatTCL = await TCLService.calculerTCLParCommune(new Date(dateDebut), new Date(dateFin));
    
    return res.status(200).json({
      success: true,
      data: resultatTCL
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.verifierExonerationTCL = async (req, res) => {
  try {
    const { secteurActivite } = req.body;
    
    if (!secteurActivite) {
      return res.status(400).json({
        success: false,
        message: 'Le secteur d\'activité est requis'
      });
    }
    
    const resultat = TCLService.verifierExonerationTCL(secteurActivite);
    
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
