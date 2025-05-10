const { AuditLog, LoginHistory } = require('../Models/Audit');
const Utilisateur = require('../Models/Utilisateur');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Vérifier si csv-writer est installé, sinon utiliser une méthode alternative
let createCsvWriter;
try {
  createCsvWriter = require('csv-writer').createObjectCsvWriter;
} catch (error) {
  console.warn("Module csv-writer non installé. Utilisation d'une méthode alternative pour l'export CSV.");
  // Fonction alternative pour créer un CSV
  createCsvWriter = (options) => {
    return {
      writeRecords: async (records) => {
        const headers = options.header.map(h => h.title).join(',');
        const rows = records.map(record => {
          return options.header.map(h => {
            const value = record[h.id] || '';
            // Échapper les virgules et les guillemets
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',');
        });
        const csvContent = [headers, ...rows].join('\n');
        fs.writeFileSync(options.path, csvContent, 'utf8');
      }
    };
  };
}

// Récupérer tous les logs d'audit avec filtres optionnels
exports.getAuditLogs = async (req, res) => {
  try {
    const { utilisateur, action, dateDebut, dateFin } = req.query;
    let query = {};

    if (utilisateur) {
      query.utilisateur = mongoose.Types.ObjectId(utilisateur);
    }

    if (action) {
      query.action = action;
    }

    if (dateDebut || dateFin) {
      query.date = {};
      if (dateDebut) query.date.$gte = new Date(dateDebut);
      if (dateFin) query.date.$lte = new Date(dateFin);
    }

    const auditLogs = await AuditLog.find(query)
      .populate('utilisateur', 'nom prenom email')
      .sort({ date: -1 });

    res.status(200).json(auditLogs);
  } catch (err) {
    console.error('Erreur getAuditLogs:', err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des logs d'audit", error: err.message });
  }
};

// Récupérer l'historique des connexions d'un utilisateur
exports.getLoginHistory = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID d'utilisateur invalide" });
    }

    const loginHistory = await LoginHistory.find({ utilisateur: userId })
      .sort({ date: -1 });

    res.status(200).json(loginHistory);
  } catch (err) {
    console.error('Erreur getLoginHistory:', err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération de l'historique de connexion", error: err.message });
  }
};

// Récupérer les actions d'un utilisateur
exports.getUserActions = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID d'utilisateur invalide" });
    }

    const userActions = await AuditLog.find({ utilisateur: userId })
      .sort({ date: -1 });

    res.status(200).json(userActions);
  } catch (err) {
    console.error('Erreur getUserActions:', err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des actions de l'utilisateur", error: err.message });
  }
};

// Enregistrer une action d'audit
exports.logAction = async (req, res) => {
  try {
    const { action, details } = req.body;
    const userId = req.user._id;

    if (!action || !details) {
      return res.status(400).json({ message: "Action et détails requis" });
    }

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const navigateur = req.headers['user-agent'];

    const auditLog = await AuditLog.logAction(userId, action, details, ip, navigateur);

    res.status(201).json(auditLog);
  } catch (err) {
    console.error('Erreur logAction:', err);
    res.status(500).json({ message: "Erreur serveur lors de l'enregistrement de l'action", error: err.message });
  }
};

// Exporter les logs d'audit en CSV
exports.exportAuditLogsToCSV = async (req, res) => {
  try {
    const { utilisateur, action, dateDebut, dateFin } = req.query;
    let query = {};

    if (utilisateur) {
      query.utilisateur = mongoose.Types.ObjectId(utilisateur);
    }

    if (action) {
      query.action = action;
    }

    if (dateDebut || dateFin) {
      query.date = {};
      if (dateDebut) query.date.$gte = new Date(dateDebut);
      if (dateFin) query.date.$lte = new Date(dateFin);
    }

    const auditLogs = await AuditLog.find(query)
      .populate('utilisateur', 'nom prenom email')
      .sort({ date: -1 });

    // Préparer les données pour le CSV
    const csvData = auditLogs.map(log => ({
      id: log._id.toString(),
      utilisateur: log.utilisateur ? `${log.utilisateur.nom} ${log.utilisateur.prenom || ''} (${log.utilisateur.email})` : 'Inconnu',
      action: log.action,
      details: log.details,
      date: new Date(log.date).toLocaleString(),
      ip: log.ip || 'Non disponible',
      navigateur: log.navigateur || 'Non disponible'
    }));

    // Créer un fichier CSV temporaire
    const tempFilePath = path.join(__dirname, '../temp', `audit_logs_${Date.now()}.csv`);

    // S'assurer que le répertoire temp existe
    if (!fs.existsSync(path.join(__dirname, '../temp'))) {
      fs.mkdirSync(path.join(__dirname, '../temp'), { recursive: true });
    }

    const csvWriter = createCsvWriter({
      path: tempFilePath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'utilisateur', title: 'Utilisateur' },
        { id: 'action', title: 'Action' },
        { id: 'details', title: 'Détails' },
        { id: 'date', title: 'Date' },
        { id: 'ip', title: 'Adresse IP' },
        { id: 'navigateur', title: 'Navigateur' }
      ]
    });

    await csvWriter.writeRecords(csvData);

    // Envoyer le fichier
    res.download(tempFilePath, 'audit_logs.csv', (err) => {
      if (err) {
        console.error('Erreur lors de l\'envoi du fichier CSV:', err);
      }

      // Supprimer le fichier temporaire après l'envoi
      fs.unlinkSync(tempFilePath);
    });
  } catch (err) {
    console.error('Erreur exportAuditLogsToCSV:', err);
    res.status(500).json({ message: "Erreur serveur lors de l'exportation des logs d'audit", error: err.message });
  }
};
