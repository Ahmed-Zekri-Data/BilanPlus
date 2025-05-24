const Commande = require('../Models/CommandeAchat');
const Produit = require('../Models/Produit');
const Fournisseur = require('../Models/Fournisseur');
const sendEmail = require('../Utils/sendEmail');

// Generate unique 8-digit ID
const generateUniqueId = () => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

const createCommande = async (req, res) => {
  try {
    const {   
      produit,
      quantite,
      type_livraison,
      createdAt,
      date_fin 
    } = req.body;
    
    // Get product details to find matching suppliers
    const produitDoc = await Produit.findById(produit);
    if (!produitDoc) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // Find suppliers matching product category
    const fournisseurs = await Fournisseur.find({ categorie: produitDoc.categorie });
    if (!fournisseurs || fournisseurs.length === 0) {
      return res.status(404).json({ 
        message: "Aucun fournisseur trouvé dans cette catégorie",
        categorie: produitDoc.categorie
      });
    }

    // Create command with suppliers list
    const nouvelleCommande = new Commande({
      produit,
      quantite,
      statut: 'En attente',
      type_livraison,
      createdAt,
      date_fin,
      fournisseurs: fournisseurs.map(f => ({
        fournisseurID: f._id
      }))
    });
    
    const commandeSauvegardee = await nouvelleCommande.save();

    // Calculate delivery days based on type_livraison
    const deliveryDays = {
      'SARL': 5,
      'EURL': 4,
      'SAS': 3,
      'SA': 2,
      'SCI': 6,
      'Auto-entrepreneur': 7
    }[type_livraison] || 5;

    try {
      // Generate unique ID for this notification
      const customId = generateUniqueId();

      // Call notify function with all required data
      await notifySuppliers({
        body: {
          produit,
          quantite,
          type_livraison,
          deliveryDays,
          commandeId: commandeSauvegardee._id,
          fournisseurs: fournisseurs.map(f => f._id),
          customId
        }
      }, null); // Pass null instead of res to prevent response sending

      // Send success response with both command and notification info
      res.status(201).json({
        commande: commandeSauvegardee,
        notification: {
          status: 'success',
          message: 'Commande créée et notifications envoyées avec succès',
          notificationId
        }
      });
    } catch (notifyError) {
      // If notification fails, still return the command but with notification error
      console.error('Error sending notifications:', notifyError);
      res.status(201).json({
        commande: commandeSauvegardee,
        notification: {
          status: 'error',
          message: 'Commande créée mais erreur lors de l\'envoi des notifications',
          error: notifyError.message
        }
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const notifySuppliers = async (req, res) => {
  try {
    const { produit, quantite, type_livraison, deliveryDays, commandeId, fournisseurs, notificationId } = req.body;
    
    const produitDoc = await Produit.findById(produit);
    if (!produitDoc) {
      if (res) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }
      throw new Error("Produit non trouvé");
    }

    const categorie = produitDoc.categorie;
    const fournisseursDocs = await Fournisseur.find({ _id: { $in: fournisseurs } });
    if (!fournisseursDocs || fournisseursDocs.length === 0) {
      if (res) {
        return res.status(404).json({ 
          message: "Aucun fournisseur trouvé dans cette catégorie",
          categorie: categorie
        });
      }
      throw new Error(`Aucun fournisseur trouvé dans la catégorie ${categorie}`);
    }

    // Send individual emails to each supplier with their specific link
    for (const fournisseur of fournisseursDocs) {
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
                <p><strong>Produit:</strong> ${produitDoc.nom}</p>
                <p><strong>Quantité:</strong> ${quantite} unités</p>
                <p><strong>Catégorie:</strong> ${categorie}</p>
                <p><strong>Type de livraison:</strong> ${type_livraison}</p>
                <p><strong>Délai de livraison estimé:</strong> ${deliveryDays} jours</p>
              </div>

              <p>Merci de consulter et valider si vous êtes concerné par cette commande.</p>
              
              <a href="${process.env.API_URL}/devis/${commandeId}/${fournisseur._id}" class="button">Voir la commande</a>
            </div>
            <div class="footer">
              <p>Cordialement,<br>Bilan Plus</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailResult = await sendEmail(
        fournisseur.email,
        `Nouvelle commande - Catégorie : ${categorie}`,
        `Bonjour,\n\nUne commande a été créée pour le produit "${produitDoc.nom}" (${quantite} unités).\nType de livraison: ${type_livraison}\nDélai estimé: ${deliveryDays} jours\nMerci de consulter et valider si vous êtes concerné.\n\nCordialement,\nBilan Plus.`,
        htmlTemplate
      );

      if (!emailResult.success) {
        console.error(`Failed to send email to ${fournisseur.email}:`, emailResult.error);
      }
    }

    const result = { 
      success: true,
      message: "Commande créée et emails envoyés avec succès",
      notificationId,
      fournisseursNotifies: fournisseursDocs.length
    };

    if (res) {
      res.status(201).json(result);
    }
    return result;
  } catch (err) {
    console.error(err);
    if (res) {
      res.status(400).json({ message: err.message });
    }
    throw err;
  }
};

const getAllCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find()
      .populate('produit', 'nom categorie')
      .populate('fournisseurs.fournisseurID', 'nom email categorie')
      .sort({ createdAt: -1 });

    res.status(200).json(commandes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProductCategories = async (req, res) => {
  try {
    const categories = await Produit.distinct('categorie');
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCommandesWithFilters = async (req, res) => {
  try {
    const { fournisseur, search, produit, page = 0, limit = 5 } = req.query;
    let query = {};

    // Appliquer les filtres
    if (search) {
      query.$or = [
        { 'produit.nom': { $regex: search, $options: 'i' } },
        { 'fournisseurs.fournisseurID.nom': { $regex: search, $options: 'i' } }
      ];
    }

    if (produit) {
      query.produit = produit;
    }

    if (fournisseur) {
      query['fournisseurs.fournisseurID.nom'] = fournisseur;
    }

    // Calculer le nombre total de commandes
    const totalItems = await Commande.countDocuments(query);

    // Récupérer les commandes avec pagination
    const commandes = await Commande.find(query)
      .populate('produit', 'nom categorie')
      .populate('fournisseurs.fournisseurID', 'nom email categorie')
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      commandes,
      totalItems,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalItems / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllProduits = async (req, res) => {
  try {
    const produits = await Produit.find().select('_id nom');
    res.status(200).json(produits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const updateCommande = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const commande = await Commande.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('produit', 'nom categorie')

    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    res.status(200).json(commande);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteCommande = async (req, res) => {
  try {
    const { id } = req.params;
    const commande = await Commande.findByIdAndDelete(id);
    
    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    res.status(200).json({ message: "Commande supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCommandeById = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id)
      .populate('produit', 'nom categorie')
      .populate({
        path: 'fournisseurs.fournisseurID',
        select: 'nom email categorie'
      });

    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    res.status(200).json(commande);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateStatut = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const commande = await Commande.findByIdAndUpdate(
      id,
      { statut },
      { new: true, runValidators: true }
    ).populate('produit', 'nom categorie')
     .populate('fournisseurID', 'nom email');

    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    res.status(200).json(commande);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};





module.exports = {
  createCommande,
  notifySuppliers,
  getProductCategories,
  getCommandesWithFilters,
  getAllProduits,
  updateCommande,
  deleteCommande,
  getAllCommandes,
  getCommandeById,
  updateStatut
};

