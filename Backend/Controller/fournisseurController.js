const Fournisseur = require("../Models/Fournisseur");

// 📌 Récupérer tous les fournisseurs
exports.getAllFournisseurs = async (req, res) => {
    try {
        const fournisseurs = await Fournisseur.find();
        res.status(200).json(fournisseurs);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};

// 📌 Ajouter un nouveau fournisseur
exports.createFournisseur = async (req, res) => {
    try {
        const nouveauFournisseur = new Fournisseur(req.body);
        await nouveauFournisseur.save();
        res.status(201).json(nouveauFournisseur);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de l'ajout", error });
    }
};

// 📌 Modifier un fournisseur
exports.updateFournisseur = async (req, res) => {
    try {
        const fournisseur = await Fournisseur.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(fournisseur);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la mise à jour", error });
    }
};

// 📌 Supprimer un fournisseur
exports.deleteFournisseur = async (req, res) => {
    try {
        await Fournisseur.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Fournisseur supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression", error });
    }
};

// 📌 Récupérer les fournisseurs par catégorie
exports.getFournisseursByCategorie = async (req, res) => {
    try {
        const { categorie } = req.params;
        const fournisseurs = await Fournisseur.find({ categorie });
        
        if (!fournisseurs || fournisseurs.length === 0) {
            return res.status(404).json({ 
                message: "Aucun fournisseur trouvé dans cette catégorie",
                categorie 
            });
        }

        res.status(200).json(fournisseurs);
    } catch (error) {
        res.status(500).json({ 
            message: "Erreur lors de la récupération des fournisseurs", 
            error 
        });
    }
};
