const DeclarationFiscale = require("../Models/DeclarationFiscale");

const DF = DeclarationFiscale;

// Fonction utilitaire pour vérifier l'existence d'une déclaration par ID
const findDeclarationById = async (id) => {
    try {
        const declaration = await DF.findById(id);
        if (!declaration) {
            throw new Error("Déclaration non trouvée");
        }
        return declaration;
    } catch (err) {
        throw new Error(err.message);
    }
};

// Ajouter une déclaration fiscale
async function addDF(req, res) {
    try {
        const newDF = new DF({
            periode: req.body.periode,
            montantTotal: req.body.montantTotal,
            statut: req.body.statut,
            compteComptable: req.body.compteComptable,
        });
        await newDF.save();
        res.status(201).json({ message: "Déclaration fiscale ajoutée", data: newDF });
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de l'ajout de la déclaration", error: err.message });
    }
}

// Récupérer toutes les déclarations fiscales
async function getall(req, res) {
    try {
        const getDF = await DF.find().populate("compteComptable");
        res.status(200).json(getDF);
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la récupération", error: err.message });
    }
}

// Récupérer une déclaration fiscale par ID
async function getbyid(req, res) {
    try {
        const getoneDF = await DF.findById(req.params.id).populate("compteComptable");
        if (!getoneDF) {
            return res.status(404).json({ message: "Déclaration non trouvée" });
        }
        res.status(200).json(getoneDF);
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la récupération", error: err.message });
    }
}

// Supprimer une déclaration fiscale
async function deleteDF(req, res) {
    try {
        const DFdeleted = await DF.findByIdAndDelete(req.params.id);
        if (!DFdeleted) {
            return res.status(404).json({ message: "Déclaration non trouvée" });
        }
        res.status(200).json({ message: "Déclaration supprimée" });
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la suppression", error: err.message });
    }
}

// Mettre à jour une déclaration fiscale
async function updateDF(req, res) {
    try {
        const DFupdated = await DF.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!DFupdated) {
            return res.status(404).json({ message: "Déclaration non trouvée" });
        }
        res.status(200).json({ message: "Déclaration mise à jour", data: DFupdated });
    } catch (err) {
        res.status(400).json({ message: "Erreur lors de la mise à jour", error: err.message });
    }
}

module.exports = { addDF, getall, getbyid, deleteDF, updateDF, findDeclarationById };