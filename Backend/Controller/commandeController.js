// controllers/commandeController.js
const Commande = require('../Models/commandeAchat');


const createCommande = async (req, res) => {

const { produit, quantite, prix, statut, fournisseurID } = req.body;

  try {
    const commande = new Commande({
      produit: produit || null,
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
      .populate("produit")
      .populate("fournisseurID");
    res.status(200).json(commandes);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateCommande = async (req, res) => {
  const { id } = req.params;
  let { produit, quantite, prix, statut, fournisseurID } = req.body; 

  try {
    const updatedCommande = await Commande.findByIdAndUpdate(
      id,
      { produit, quantite, prix, statut, fournisseurID },
      { new: true }
    );

    if (!updatedCommande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    res.status(200).json(updatedCommande);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateStatut = async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;
  
  try {
    const commande = await Commande.findById(id);
    
    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    if (statut === "Approuvé") {
      commande.quantite -= 1;
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
    if (!deletedCommande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
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

