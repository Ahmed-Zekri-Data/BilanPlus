const Role = require("../Models/Role");
const Utilisateur = require("../Models/Utilisateur");

// Obtenir tous les rôles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json(roles);
  } catch (err) {
    console.error("Erreur getAllRoles:", err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des rôles" });
  }
};

// Obtenir un rôle par son ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({ message: "Rôle non trouvé" });
    }

    res.status(200).json(role);
  } catch (err) {
    console.error("Erreur getRoleById:", err);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du rôle" });
  }
};

// Créer un nouveau rôle
exports.createRole = async (req, res) => {
  try {
    const { nom, description, permissions } = req.body;

    // Validation des données
    if (!nom) {
      return res.status(400).json({ message: "Le nom du rôle est requis" });
    }

    // Vérifier si le nom du rôle existe déjà
    const roleExistant = await Role.findOne({ nom });
    if (roleExistant) {
      return res.status(400).json({ message: "Un rôle avec ce nom existe déjà" });
    }

    // Créer le nouveau rôle
    const nouveauRole = new Role({
      nom,
      description,
      permissions: permissions || {}
    });

    // Sauvegarder le rôle
    const roleSauvegarde = await nouveauRole.save();

    res.status(201).json({
      message: "Rôle créé avec succès",
      role: roleSauvegarde
    });
  } catch (err) {
    console.error("Erreur createRole:", err);
    res.status(500).json({ message: "Erreur serveur lors de la création du rôle" });
  }
};

// Mettre à jour un rôle
exports.updateRole = async (req, res) => {
  try {
    const { nom, description, permissions, actif } = req.body;
    const roleId = req.params.id;

    // Vérifier si le rôle existe
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: "Rôle non trouvé" });
    }

    // Vérifier si le nouveau nom existe déjà (sauf pour le même rôle)
    if (nom && nom !== role.nom) {
      const roleExistant = await Role.findOne({ nom });
      if (roleExistant) {
        return res.status(400).json({ message: "Un rôle avec ce nom existe déjà" });
      }
    }

    // Mettre à jour les champs
    if (nom) role.nom = nom;
    if (description !== undefined) role.description = description;
    if (actif !== undefined) role.actif = actif;
    
    // Mettre à jour les permissions individuellement pour ne pas écraser celles non fournies
    if (permissions) {
      Object.keys(permissions).forEach(key => {
        if (role.permissions.hasOwnProperty(key)) {
          role.permissions[key] = permissions[key];
        }
      });
    }

    // Sauvegarder les modifications
    const roleMisAJour = await role.save();

    res.status(200).json({
      message: "Rôle mis à jour avec succès",
      role: roleMisAJour
    });
  } catch (err) {
    console.error("Erreur updateRole:", err);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du rôle" });
  }
};

// Supprimer un rôle
exports.deleteRole = async (req, res) => {
  try {
    const roleId = req.params.id;

    // Vérifier si le rôle existe
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: "Rôle non trouvé" });
    }

    // Vérifier si des utilisateurs utilisent ce rôle
    const utilisateursAvecRole = await Utilisateur.countDocuments({ role: roleId });
    if (utilisateursAvecRole > 0) {
      return res.status(400).json({ 
        message: "Impossible de supprimer ce rôle car il est assigné à des utilisateurs",
        count: utilisateursAvecRole
      });
    }

    // Supprimer le rôle
    await Role.findByIdAndDelete(roleId);

    res.status(200).json({
      message: "Rôle supprimé avec succès"
    });
  } catch (err) {
    console.error("Erreur deleteRole:", err);
    res.status(500).json({ message: "Erreur serveur lors de la suppression du rôle" });
  }
};

// Obtenir le nombre d'utilisateurs par rôle
exports.getUtilisateursParRole = async (req, res) => {
  try {
    const stats = await Utilisateur.aggregate([
      {
        $lookup: {
          from: "roles", // Le nom de la collection dans MongoDB
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
    res.status(500).json({ message: "Erreur serveur lors de la récupération des statistiques" });
  }
};

// Analyser l'utilisation des permissions
exports.analyserUtilisationPermissions = async (req, res) => {
  try {
    // Récupérer tous les rôles avec leur nombre d'utilisateurs
    const roles = await Role.find();
    
    // Initialiser un objet pour compter l'utilisation des permissions
    const permissionStats = {};
    
    // Propriétés de permissions disponibles dans le schéma
    const permissionKeys = Object.keys(roles[0].permissions.toObject());
    
    // Initialiser les compteurs pour chaque permission
    permissionKeys.forEach(key => {
      permissionStats[key] = {
        enabled: 0,
        roleCount: 0,
        userCount: 0
      };
    });
    
    // Compter les permissions activées par rôle
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
    res.status(500).json({ message: "Erreur serveur lors de l'analyse des permissions" });
  }
};