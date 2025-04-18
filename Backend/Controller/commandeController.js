const Commande = require('../Models/commandeAchat');
const Produit = require('../Models/Produit');
const Fournisseur = require('../Models/Fournisseur');

const sendEmail = require('../Utils/sendEmail');

const createCommande = async (req, res) => {
  const { produit, quantite, prix, statut, fournisseurID } = req.body;
  try {
    const produitDoc = await Produit.findById(produit);
    if (!produitDoc) return res.status(404).json({ message: "Produit non trouvé" });

    // Vérification du stock supprimée pour permettre l'ajout dans tous les cas
    /*
    if (produitDoc.stock < quantite) {
      return res.status(400).json({ message: `Stock insuffisant : ${produitDoc.stock} disponibles, ${quantite} demandés` });
    }
    */

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

    // Vérification du stock supprimée pour permettre l'approbation dans tous les cas
    /*
    if (statut === "Approuvé" && commande.produit.stock < commande.quantite) {
      return res.status(400).json({ message: `Stock insuffisant : ${commande.produit.stock} disponibles` });
    }
    */

    // Mise à jour du stock supprimée pour garder le stock informatif
    /*
    if (statut === "Approuvé") {
      commande.produit.stock -= commande.quantite;
      await commande.produit.save();
    }
    */

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

const createDevis = async (req, res) => {
  const { produit, quantite, categorie } = req.body;

  try {
    // Find all suppliers in the same category
    const fournisseurs = await Fournisseur.find({ categorie: categorie });
    
    if (!fournisseurs || fournisseurs.length === 0) {
      return res.status(404).json({ 
        message: "Aucun fournisseur trouvé dans cette catégorie",
        categorie: categorie
      });
    }

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .button { 
            display: inline-block; 
            padding: 10px 20px; 
            background-color: #4CAF50; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin-top: 20px; 
          }
          .details { 
            background-color: #f9f9f9; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nouvelle Commande - ${categorie}</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Une nouvelle commande a été créée pour votre catégorie.</p>
            
            <div class="details">
              <h3>Détails de la commande:</h3>
              <p><strong>Produit:</strong> ${produit}</p>
              <p><strong>Quantité:</strong> ${quantite} unités</p>
              <p><strong>Catégorie:</strong> ${categorie}</p>
            </div>

            <p>Merci de consulter et valider si vous êtes concerné par cette commande.</p>
            
            <a href="#" class="button">Voir la commande</a>
          </div>
          <div class="footer">
            <p>Cordialement,<br>Bilan Plus</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Get all supplier emails
    const supplierEmails = fournisseurs.map(f => f.email);
    
    // Send email to all suppliers
    const emailResult = await sendEmail(
      supplierEmails,
      `Nouvelle commande - Catégorie : ${categorie}`,
      `Bonjour,\n\nUne commande a été créée pour le produit "${produit}" (${quantite} unités).\nMerci de consulter et valider si vous êtes concerné.\n\nCordialement,\nBilan Plus.`,
      htmlTemplate
    );

    if (!emailResult.success) {
      return res.status(400).json({ 
        message: "Devis créé mais l'email n'a pas pu être envoyé",
        error: emailResult.error 
      });
    }

    res.status(201).json({ 
      message: "Devis créé et emails envoyés avec succès",
      emailId: emailResult.messageId,
      fournisseursNotifies: fournisseurs.length
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};


module.exports = {
  createCommande,
  getAllCommandes,
  updateCommande,
  deleteCommande,
  updateStatut,
  createDevis
};