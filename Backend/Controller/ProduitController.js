var produit = require("../Models/Produit");
const { validationResult } = require('express-validator');

async function addProduit(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const newProd = new produit({
            nom: req.body.nom,
            categorie: req.body.categorie,
            prix: req.body.prix,
            stock: req.body.stock,
            seuilAlerte: req.body.seuilAlerte 
        });
        const savedProduit = await newProd.save();
        res.status(200).json(savedProduit);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function getall(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const sortOrder = req.query.sort === 'desc' ? -1 : 1; // asc (1) or desc (-1)
        const getProduit = await produit.find().sort({ stock: sortOrder });
        res.json(getProduit);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function getbyid(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const getunproduit = await produit.findById(req.params.id);
        if (!getunproduit) {
            return res.status(404).json({ error: "Produit non trouvé" });
        }
        res.json(getunproduit);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function deleteproduit(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const produitdeleted = await produit.findByIdAndDelete(req.params.id);
        if (!produitdeleted) {
            return res.status(404).json({ error: "Produit non trouvé" });
        }
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function updateproduit(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const produitUPDATED = await produit.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            {
                new: true,
                runValidators: true
            }
        );
        if (!produitUPDATED) {
            return res.status(404).json({ error: "Produit non trouvé" });
        }
        res.status(200).json(produitUPDATED);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = { addProduit, getall, getbyid, deleteproduit, updateproduit };