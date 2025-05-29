const MS = require("../Models/MouvementStock");
const Produit = require("../Models/Produit");
const { validationResult } = require('express-validator');

async function addMS(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { produit, type, quantite } = req.body;

        // Vérifier si le produit existe (déjà validé par le validator, mais conservé pour cohérence)
        const produitExistant = await Produit.findById(produit);
        if (!produitExistant) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }

        // Créer le mouvement de stock
        const newMS = new MS({
            produit,
            type,
            quantite,
            date: req.body.date || Date.now(),
        });

        // Mettre à jour le stock du produit
        if (type === "entrée") {
            produitExistant.stock += quantite;
        } else if (type === "sortie") {
            if (produitExistant.stock < quantite) {
                return res.status(400).json({ message: "Stock insuffisant pour cette sortie" });
            }
            produitExistant.stock -= quantite;
        }

        // Sauvegarder le produit mis à jour
        await produitExistant.save();

        // Sauvegarder le mouvement de stock
        const savedMS = await newMS.save();

        res.status(200).json(savedMS);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function getallMS(req, res) {
    try {
        const getMS = await MS.find().populate("produit");
        res.json(getMS);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function getbyid(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const getMS = await MS.findById(req.params.id).populate("produit");
        if (!getMS) {
            return res.status(404).json({ message: "Mouvement non trouvé" });
        }
        res.json(getMS);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function deleteMS(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const mouvement = await MS.findById(req.params.id);
        if (!mouvement) {
            return res.status(404).json({ message: "Mouvement non trouvé" });
        }

        // Restaurer le stock du produit
        const produit = await Produit.findById(mouvement.produit);
        if (produit) {
            if (mouvement.type === "entrée") {
                if (produit.stock < mouvement.quantite) {
                    return res.status(400).json({ message: "Stock insuffisant pour annuler cette entrée" });
                }
                produit.stock -= mouvement.quantite;
            } else if (mouvement.type === "sortie") {
                produit.stock += mouvement.quantite;
            }
            await produit.save();
        }

        // Supprimer le mouvement
        await MS.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Mouvement supprimé" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function updateMS(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const mouvement = await MS.findById(req.params.id);
        if (!mouvement) {
            return res.status(404).json({ message: "Mouvement non trouvé" });
        }

        const { produit, type, quantite } = req.body;

        // Restaurer le stock avant la mise à jour
        const produitExistant = await Produit.findById(mouvement.produit);
        if (mouvement.type === "entrée") {
            produitExistant.stock -= mouvement.quantite;
        } else if (mouvement.type === "sortie") {
            produitExistant.stock += mouvement.quantite;
        }

        // Appliquer la nouvelle mise à jour
        const nouveauProduit = produit || mouvement.produit;
        const nouveauType = type || mouvement.type;
        const nouvelleQuantite = quantite !== undefined ? quantite : mouvement.quantite;

        const produitCible = await Produit.findById(nouveauProduit);
        if (!produitCible) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }

        if (nouveauType === "entrée") {
            produitCible.stock += nouvelleQuantite;
        } else if (nouveauType === "sortie") {
            if (produitCible.stock < nouvelleQuantite) {
                return res.status(400).json({ message: "Stock insuffisant pour cette modification" });
            }
            produitCible.stock -= nouvelleQuantite;
        }

        // Sauvegarder le produit mis à jour
        await produitCible.save();

        // Mettre à jour le mouvement
        const MSUPDATED = await MS.findByIdAndUpdate(
            req.params.id,
            { 
                produit: nouveauProduit, 
                type: nouveauType, 
                quantite: nouvelleQuantite, 
                date: req.body.date || mouvement.date 
            },
            { new: true }
        ).populate("produit");

        res.status(200).json(MSUPDATED);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

module.exports = {
    addMS,
    getallMS,
    getbyid,
    deleteMS,
    updateMS,
};