const Fournisseur = require("../Models/Fournisseur");

// 📌 Récupérer tous les fournisseurs
const getAllFournisseurs = async (req, res) => {
    try {
        const fournisseurs = await Fournisseur.find();
        res.status(200).json(fournisseurs);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};

// 📌 Ajouter un nouveau fournisseur
const createFournisseur = async (req, res) => {
    try {
        const nouveauFournisseur = new Fournisseur(req.body);
        await nouveauFournisseur.save();
        res.status(201).json(nouveauFournisseur);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de l'ajout", error });
    }
};

// 📌 Modifier un fournisseur
const updateFournisseur = async (req, res) => {
    try {
        const fournisseur = await Fournisseur.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(fournisseur);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la mise à jour", error });
    }
};

// 📌 Supprimer un fournisseur
const deleteFournisseur = async (req, res) => {
    try {
        await Fournisseur.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Fournisseur supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression", error });
    }
};

// 📌 Récupérer les fournisseurs par catégorie
const getFournisseursByCategorie = async (req, res) => {
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

const getFournisseurById = async (req, res) => {
    try {
        
        const fournisseur = await Fournisseur.findById(req.params.id);
        if (!fournisseur) {
            return res.status(404).json({ message: 'Fournisseur non trouvé' });
        }
        res.status(200).json(fournisseur);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const searchFournisseurs = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { nom: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { categorie: { $regex: search, $options: 'i' } }
            ];
        }

        const fournisseurs = await Fournisseur.find(query).sort({ nom: 1 });
        res.status(200).json(fournisseurs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 📌 Récupérer les fournisseurs avec filtres avancés (catégorie, adresse, pagination, etc.)
const getFournisseursWithFilters = async (req, res) => {
    try {
        const { page = 0, limit = 5, categorie, zoneGeo } = req.query;
        let query = {};

        if (categorie) {
            query.categorie = categorie;
        }
        if (zoneGeo) {
            query.adresse = { $regex: zoneGeo, $options: 'i' };
        }

        // Pagination
        const fournisseurs = await Fournisseur.find(query)
            .skip(Number(page) * Number(limit))
            .limit(Number(limit))
            .sort({ nom: 1 });

        // Pour la pagination totale
        const total = await Fournisseur.countDocuments(query);

        res.status(200).json({
            data: fournisseurs,
            total,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};

module.exports = {
    getAllFournisseurs,
    createFournisseur,
    updateFournisseur,
    deleteFournisseur,
    getFournisseursByCategorie,
    getFournisseurById,
    searchFournisseurs,
    getFournisseursWithFilters
};
