// controllers/commandeController.js
const Commande = require('../Models/CommandeAchat');

exports.createCommande = async (req, res) => {
  const { produit, quantite, prix, fournisseurID } = req.body;

  try {
    const commande = new Commande({ produit, quantite, prix, fournisseurID });
    await commande.save();
    res.status(201).json({ success: true, data: commande });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find().populate('fournisseurID');
    res.status(200).json({ success: true, data: commandes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCommandeById = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id).populate('fournisseurID');
    if (!commande) return res.status(404).json({ success: false, error: 'Commande non trouvée' });
    res.status(200).json({ success: true, data: commande });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateCommande = async (req, res) => {
  try {
    const commande = await Commande.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!commande) return res.status(404).json({ success: false, error: 'Commande non trouvée' });
    res.status(200).json({ success: true, data: commande });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteCommande = async (req, res) => {
  try {
    const commande = await Commande.findByIdAndDelete(req.params.id);
    if (!commande) return res.status(404).json({ success: false, error: 'Commande non trouvée' });
    res.status(200).json({ success: true, data: { message: 'Commande supprimée' } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
//commit