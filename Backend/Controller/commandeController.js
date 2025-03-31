// Controller/commandeController.js
const Commande = require('../Models/commandeAchat');
const Produit = require('../Models/Produit');

const createCommande = async (req, res) => {
  const { produit, quantite, prix, statut, fournisseurID } = req.body;
  try {
    const produitDoc = await Produit.findById(produit);
    if (!produitDoc) return res.status(404).json({ message: "Produit non trouvé" });
    if (produitDoc.stock < quantite) {
      return res.status(400).json({ message: `Stock insuffisant : ${produitDoc.stock} disponibles, ${quantite} demandés` });
    }
    const commande = new Commande({
      produit,
      quantite,
      prix,
      statut: statut || 'en attente',
      fournisseurID
    });
    const newCommande = await commande.save();
    res.status(201).json(newCommande);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAllCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find()
      .populate('produit')
      .populate('fournisseurID');
    res.status(200).json(commandes);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateCommande = async (req, res) => {
  const { id } = req.params;
  const { produit, quantite, prix, statut, fournisseurID } = req.body;
  try {
    const updatedCommande = await Commande.findByIdAndUpdate(
      id,
      { produit, quantite, prix, statut, fournisseurID },
      { new: true }
    );
    if (!updatedCommande) return res.status(404).json({ message: "Commande non trouvée" });
    res.status(200).json(updatedCommande);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateStatut = async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;
  try {
    const commande = await Commande.findById(id).populate('produit');
    if (!commande) return res.status(404).json({ message: "Commande non trouvée" });
    if (statut === "Approuvé" && commande.produit.stock < commande.quantite) {
      return res.status(400).json({ message: `Stock insuffisant : ${commande.produit.stock} disponibles` });
    }
    if (statut === "Approuvé") {
      commande.produit.stock -= commande.quantite;
      await commande.produit.save();
    }
    commande.statut = statut;
    const updatedCommande = await commande.save();
    res.status(200).json(updatedCommande);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteCommande = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCommande = await Commande.findByIdAndDelete(id);
    if (!deletedCommande) return res.status(404).json({ message: "Commande non trouvée" });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  createCommande,
  getAllCommandes,
  updateCommande,
  deleteCommande,
  updateStatut
};