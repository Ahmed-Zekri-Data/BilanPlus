const Role = require("../Models/Role");
const Utilisateur = require("../Models/Utilisateur");

// Helper function to transform permissions array to object
const transformPermissionsArrayToObject = (permissionsArray) => {
  const permissionsObject = {
    gererUtilisateursEtRoles: false,
    configurerSysteme: false,
    accesComplet: false,
    validerEcritures: false,
    cloturerPeriodes: false,
    genererEtatsFinanciers: false,
    superviserComptes: false,
    saisirEcritures: false,
    gererFactures: false,
    suivrePaiements: false,
    gererTresorerie: false,
    analyserDepensesRecettes: false,
    genererRapportsPerformance: false,
    comparerBudgetRealise: false,
    saisirNotesFrais: false,
    consulterBulletinsPaie: false,
    soumettreRemboursements: false,
    accesFacturesPaiements: false,
    telechargerDocuments: false,
    communiquerComptabilite: false
  };
  if (Array.isArray(permissionsArray)) {
    permissionsArray.forEach(perm => {
      if (permissionsObject.hasOwnProperty(perm)) {
        permissionsObject[perm] = true;
      }
    });
  }
  return permissionsObject;
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json(roles);
  } catch (err) {
    console.error("Erreur getAllRoles:", err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des rôles", error: err.message });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Rôle non trouvé" });
    }
    res.status(200).json(role);
  } catch (err) {
    console.error("Erreur getRoleById:", err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du rôle", error: err.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { nom, description, permissions, actif } = req.body;

    if (!nom) {
      return res.status(400).json({ message: "Le nom du rôle est requis" });
    }

    const roleExistant = await Role.findOne({ nom });
    if (roleExistant) {
      return res.status(400).json({ message: "Un rôle avec ce nom existe déjà" });
    }

    const transformedPermissions = transformPermissionsArrayToObject(permissions);

    const nouveauRole = new Role({
      nom,
      description,
      permissions: transformedPermissions,
      actif: actif !== undefined ? actif : true
    });

    const roleSauvegarde = await nouveauRole.save();

    res.status(201).json({
      message: "Rôle créé avec succès",
      role: roleSauvegarde
    });
  } catch (err) {
    console.error("Erreur createRole:", err);
    res.status(500).json({ message: "Erreur serveur lors de la création du rôle", error: err.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { nom, description, permissions, actif } = req.body;
    const roleId = req.params.id;

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: "Rôle non trouvé" });
    }

    if (nom && nom !== role.nom) {
      const roleExistant = await Role.findOne({ nom });
      if (roleExistant) {
        return res.status(400).json({ message: "Un rôle avec ce nom existe déjà" });
      }
    }

    if (nom) role.nom = nom;
    if (description !== undefined) role.description = description;
    if (actif !== undefined) role.actif = actif;

    if (permissions) {
      const transformedPermissions = transformPermissionsArrayToObject(permissions);
      role.permissions = transformedPermissions;
    }

    const roleMisAJour = await role.save();

    res.status(200).json({
      message: "Rôle mis à jour avec succès",
      role: roleMisAJour
    });
  } catch (err) {
    console.error("Erreur updateRole:", err);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du rôle", error: err.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const roleId = req.params.id;

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: "Rôle non trouvé" });
    }

    const utilisateursAvecRole = await Utilisateur.countDocuments({ role: roleId });
    if (utilisateursAvecRole > 0) {
      return res.status(400).json({ 
        message: "Impossible de supprimer ce rôle car il est assigné à des utilisateurs",
        count: utilisateursAvecRole
      });
    }

    await Role.findByIdAndDelete(roleId);

    res.status(200).json({
      message: "Rôle supprimé avec succès"
    });
  } catch (err) {
    console.error("Erreur deleteRole:", err);
    res.status(500).json({ message: "Erreur serveur lors de la suppression du rôle", error: err.message });
  }
};

exports.getUtilisateursParRole = async (req, res) => {
  try {
    const stats = await Utilisateur.aggregate([
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "roleInfo"
        }
      },
      {
        $unwind: "$roleInfo"
      },
      {
        $group: {
          _id: "$role",
          nom: { $first: "$roleInfo.nom" },
          description: { $first: "$roleInfo.description" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 1,
          nom: 1,
          description: 1,
          count: 1
        }
      }
    ]);

    res.status(200).json(stats);
  } catch (err) {
    console.error("Erreur getUtilisateursParRole:", err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des statistiques", error: err.message });
  }
};

exports.analyserUtilisationPermissions = async (req, res) => {
  try {
    const roles = await Role.find();
    const permissionStats = {};
    const permissionKeys = Object.keys(roles[0]?.permissions.toObject() || {});
    
    permissionKeys.forEach(key => {
      permissionStats[key] = {
        enabled: 0,
        roleCount: 0,
        userCount: 0
      };
    });

    for (const role of roles) {
      const userCount = await Utilisateur.countDocuments({ role: role._id });
      permissionKeys.forEach(key => {
        if (role.permissions[key]) {
          permissionStats[key].enabled++;
          permissionStats[key].roleCount++;
          permissionStats[key].userCount += userCount;
        }
      });
    }

    res.status(200).json({
      totalRoles: roles.length,
      totalUsers: await Utilisateur.countDocuments(),
      permissionStats
    });
  } catch (err) {
    console.error("Erreur analyserUtilisationPermissions:", err);
    res.status(500).json({ message: "Erreur serveur lors de l'analyse des permissions", error: err.message });
  }
};