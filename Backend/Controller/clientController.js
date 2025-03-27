const Client = require("../models/Client");

// ✅ Ajouter un client
exports.createClient = async (req, res) => {
    try {
        const client = new Client(req.body);
        await client.save();
        res.status(201).json(client);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Récupérer tous les clients
exports.getAllClients = async (req, res) => {
    try {
        const clients = await Client.find();
        res.json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Récupérer un client par ID
exports.getClientById = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) return res.status(404).json({ message: "Client non trouvé" });
        res.json(client);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Modifier un client
exports.updateClient = async (req, res) => {
    try {
        const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!client) return res.status(404).json({ message: "Client non trouvé" });
        res.json(client);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Supprimer un client
exports.deleteClient = async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) return res.status(404).json({ message: "Client non trouvé" });
        res.json({ message: "Client supprimé avec succès" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
