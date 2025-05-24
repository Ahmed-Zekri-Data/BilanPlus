const mongoose = require('mongoose');
const CommandeAchat = require("../Models/CommandeAchat");
const Devis = require("../Models/Devis");
const Fournisseur = require("../Models/Fournisseur");
const Produit = require("../Models/Produit");

// Get commande details for devis
const getCommandeDetails = async (req, res) => {
  try {
    const { commandeId, fournisseurId } = req.params;

    console.log('=== DÉBUT RÉCUPÉRATION DÉTAILS ===');
    console.log('IDs reçus:', { commandeId, fournisseurId });

    // 1. Vérification des ObjectIds
    if (!mongoose.Types.ObjectId.isValid(commandeId) || !mongoose.Types.ObjectId.isValid(fournisseurId)) {
      console.log('IDs invalides:', { commandeId, fournisseurId });
      return res.status(400).json({
        success: false,
        message: "Format d'ID invalide",
        details: "Les IDs doivent être des ObjectIds MongoDB valides"
      });
    }

    // 2. Recherche de la commande avec populate
    const commande = await CommandeAchat.findById(commandeId)
      .populate('produit', 'nom categorie')
      .populate({
        path: 'fournisseurs.fournisseurID',
        select: 'nom email'
      });

    if (!commande) {
      console.log('Commande non trouvée:', commandeId);
      return res.status(404).json({
        success: false,
        message: "Commande non trouvée",
        details: `Aucune commande trouvée avec l'ID: ${commandeId}`
      });
    }

    console.log('Commande trouvée:', {
      id: commande._id,
      fournisseurs: commande.fournisseurs.map(f => ({
        id: f.fournisseurID._id.toString(),
        nom: f.fournisseurID.nom
      }))
    });

    // 3. Vérification du fournisseur
    const fournisseur = commande.fournisseurs.find(f => {
      const match = f.fournisseurID._id.toString() === fournisseurId;
      console.log('Comparaison fournisseur:', {
        fournisseurId,
        fournisseurID: f.fournisseurID._id.toString(),
        match
      });
      return match;
    });

    console.log('Fournisseur trouvé:', fournisseur ? 'Oui' : 'Non');

    if (!fournisseur) {
      console.log('Fournisseur non trouvé dans la commande');
      return res.status(403).json({
        success: false,
        message: "Fournisseur non associé à cette commande",
        details: {
          commandeId,
          fournisseurId,
          fournisseurs: commande.fournisseurs.map(f => f.fournisseurID._id.toString())
        }
      });
    }

    // 4. Récupération des devis existants
    const devisExistant = await Devis.findOne({
      commandeID: commandeId,
      fournisseurID: fournisseurId
    });

    console.log('Devis existant:', devisExistant ? 'Oui' : 'Non');
    console.log('=== FIN RÉCUPÉRATION DÉTAILS ===');

    res.status(200).json({
      success: true,
      data: {
        commande: {
          _id: commande._id,
          produit: commande.produit,
          quantite: commande.quantite,
          type_livraison: commande.type_livraison,
          createdAt: commande.createdAt
        },
        fournisseur: fournisseur.fournisseurID,
        devisExistant: devisExistant
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des détails:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des détails",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create new devis
const createDevis = async (req, res) => {
  try {
    const { commandeId, fournisseurId } = req.params;
    const { prix } = req.body;

    console.log('=== DÉBUT CRÉATION DEVIS ===');
    console.log('IDs reçus:', { commandeId, fournisseurId });

    // 1. Vérification des ObjectIds
    if (!mongoose.Types.ObjectId.isValid(commandeId) || !mongoose.Types.ObjectId.isValid(fournisseurId)) {
      console.log('IDs invalides:', { commandeId, fournisseurId });
      return res.status(400).json({
        success: false,
        message: "Format d'ID invalide",
        details: "Les IDs doivent être des ObjectIds MongoDB valides"
      });
    }

    // 2. Recherche de la commande
    const commande = await CommandeAchat.findById(commandeId);
    
    if (!commande) {
      console.log('Commande non trouvée:', commandeId);
      return res.status(404).json({
        success: false,
        message: "Commande non trouvée",
        details: `Aucune commande trouvée avec l'ID: ${commandeId}`
      });
    }

    console.log('Commande trouvée:', {
      id: commande._id,
      fournisseurs: commande.fournisseurs.map(f => ({
        id: f.fournisseurID.toString(),
        statut: f.statut
      }))
    });

    // 3. Vérification du fournisseur
    const fournisseurExiste = commande.fournisseurs.some(f => {
      const match = f.fournisseurID.toString() === fournisseurId;
      console.log('Comparaison fournisseur:', {
        fournisseurId,
        fournisseurID: f.fournisseurID.toString(),
        match
      });
      return match;
    });

    console.log('Fournisseur existe:', fournisseurExiste);

    if (!fournisseurExiste) {
      console.log('Fournisseur non trouvé dans la commande');
      return res.status(403).json({
        success: false,
        message: "Fournisseur non associé à cette commande",
        details: {
          commandeId,
          fournisseurId,
          fournisseurs: commande.fournisseurs.map(f => f.fournisseurID.toString())
        }
      });
    }

    // 4. Vérification si un devis existe déjà
    const devisExistant = await Devis.findOne({
      commandeID: commandeId,
      fournisseurID: fournisseurId
    });

    if (devisExistant) {
      console.log('Devis déjà existant');
      return res.status(400).json({
        success: false,
        message: "Devis déjà existant",
        details: "Un devis existe déjà pour cette commande et ce fournisseur"
      });
    }

    // 5. Création du devis
    const devis = await Devis.create({
      prix: prix,
      fournisseurID: fournisseurId,
      commandeID: commandeId,
      date: new Date()
    });

    console.log('Devis créé:', devis._id);

    // 6. Mise à jour de la commande
    await CommandeAchat.findByIdAndUpdate(
      commandeId,
      {
        $push: { devis: devis._id }
      }
    );

    console.log('Commande mise à jour avec le devis');

    // 7. Récupération du devis avec les détails
    const devisComplet = await Devis.findById(devis._id)
      .populate('fournisseurID', 'nom email')
      .populate('commandeID', 'produit quantite');

    console.log('=== FIN CRÉATION DEVIS ===');

    res.status(200).json({
      success: true,
      devis: devisComplet,
      message: "Devis créé avec succès"
    });

  } catch (error) {
    console.error('Erreur lors de la création du devis:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du devis",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all devis
const getAllDevis = async (req, res) => {
  try {
    const devis = await Devis.find()
      .populate({
        path: 'fournisseurID',
        select: 'nom email'
      })
      .populate({
        path: 'commandeID',
        select: 'produit date_fin',
        populate: {
          path: 'produit',
          select: 'nom categorie'
        }
      })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      devis: devis
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des devis:', error);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la récupération des devis",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Accept devis
const acceptDevis = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Mettre à jour le devis
    const devis = await Devis.findByIdAndUpdate(
      id,
      { statut: 'Accepté' },
      { new: true }
    ).populate({
      path: 'fournisseurID',
      select: 'nom email'
    }).populate({
      path: 'commandeID',
      select: 'produit date_fin'
    });

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: "Devis non trouvé"
      });
    }

    // 2. Mettre à jour la commande
    const commande = await CommandeAchat.findByIdAndUpdate(
      devis.commandeID._id,
      {
        statut: 'Accepté',
        fournisseurs: [{
          fournisseurID: devis.fournisseurID._id,
          statut: 'Accepté'
        }]
      },
      { new: true }
    ).populate('produit', 'nom categorie')
     .populate('fournisseurs.fournisseurID', 'nom email');

    // 3. Rejeter tous les autres devis pour cette commande
    await Devis.updateMany(
      {
        commandeID: devis.commandeID._id,
        _id: { $ne: devis._id }
      },
      { statut: 'Refusé' }
    );

    res.status(200).json({
      success: true,
      message: "Devis accepté avec succès",
      devis: devis,
      commande: commande
    });
  } catch (error) {
    console.error('Erreur lors de l\'acceptation du devis:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'acceptation du devis",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Reject devis
const rejectDevis = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Mettre à jour le devis
    const devis = await Devis.findByIdAndUpdate(
      id,
      { statut: 'Refusé' },
      { new: true }
    ).populate({
      path: 'fournisseurID',
      select: 'nom email'
    }).populate({
      path: 'commandeID',
      select: 'produit date_fin'
    });

    if (!devis) {
      return res.status(404).json({
        success: false,
        message: "Devis non trouvé"
      });
    }

    // 2. Vérifier s'il reste des devis en attente pour cette commande
    const devisEnAttente = await Devis.countDocuments({
      commandeID: devis.commandeID._id,
      statut: 'En attente'
    });

    // 3. Si aucun devis en attente, mettre à jour le statut de la commande
    if (devisEnAttente === 0) {
      await CommandeAchat.findByIdAndUpdate(
        devis.commandeID._id,
        { statut: 'Refusé' }
      );
    }

    res.status(200).json({
      success: true,
      message: "Devis refusé avec succès",
      devis: devis
    });
  } catch (error) {
    console.error('Erreur lors du rejet du devis:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du rejet du devis",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getCommandeDetails,
  createDevis,
  getAllDevis,
  acceptDevis,
  rejectDevis
};