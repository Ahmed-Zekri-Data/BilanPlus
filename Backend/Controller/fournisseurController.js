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
        // Convert address to coordinates using a geocoding service
        const address = req.body.adresse;
        const coordinates = await geocodeAddress(address);
        
        // Create new fournisseur with coordinates
        const nouveauFournisseur = new Fournisseur({
            ...req.body,
            lat: coordinates.lat,
            long: coordinates.lng
        });
        console.log(coordinates);
        await nouveauFournisseur.save();
        res.status(201).json(nouveauFournisseur);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de l'ajout", error });
    }
};

// Helper function to convert address to coordinates
const geocodeAddress = async (address) => {
    try {
        // Add error handling for empty address
        if (!address || address.trim() === '') {
            throw new Error('Address is required');
        }

        // Use Nominatim API with proper headers and parameters
        const encodedAddress = encodeURIComponent(address);
        const url = `https://geocode.maps.co/search?q=${address}&api_key=${process.env.MAP_API_KEY}`;
        
        const axios = require('axios');
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'YourAppName/1.0',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        if (!response.data) {
            throw new Error('Geocoding service unavailable');
        }

        const data = response.data;

        if (data && data.length > 0) {
            const coordinates = {
                lat: parseFloat(data[0].lat) || 0,
                lng: parseFloat(data[0].lon) || 0
            };
            console.log('Coordinates:', coordinates); 
            return coordinates;
        }
        
        // Return default coordinates if geocoding fails
        console.log('Geocoding failed, using default coordinates');
        return {
            lat: 0,
            lng: 0
        };
    } catch (error) {
        console.error('Geocoding error:', error); // Debug log
        // Return default coordinates instead of throwing error
        return {
            lat: 0,
            lng: 0
        };
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
                { contact: { $regex: search, $options: 'i' } },
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
