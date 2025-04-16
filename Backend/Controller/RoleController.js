const Role = require("../Models/Role");
const Utilisateur = require("../Models/Utilisateur");

// Obtenir tous les rôles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
};

// Créer un nouveau rôle
exports.createRole = async (req, res) => {
  try {
    const { nom, description, permissions } = req.body;
    
    // Vérifier si le nom du rôle existe déjà
    const roleExistant = await Role.findOne({ nom });
    if (roleExistant) {
      return res.status(400).json({ message: "Un rôle avec ce nom existe déjà" });
    }
    
    const newRole = new Role({
      nom,
      description,
      permissions
    });
    
    await newRole.save();
    
    res.status(201).json({ 
      message: "Rôle créé avec succès",
      role: newRole
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mettre à jour un rôle
exports.updateRole = async (req, res) => {
  try {
    const { nom, description, permissions, actif } = req.body;
    
    // Vérifier si on essaie de mettre à jour le nom et s'il existe déjà
    if (nom) {
      const roleExistant = await Role.findOne({ 
        nom, 
        _id: { $ne: req.params.id } 
      });
      
      if (roleExistant) {
        return res.status(400).json({ message: "Un rôle avec ce nom existe déjà" });
      }
    }
    
    const updateData = {
      nom, description, permissions, actif
    };
    
    // Supprimer les champs undefined
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );
    
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!role) {
      return res.status(404).json({ message: "Rôle non trouvé" });
    }
    
    res.status(200).json({ 
      message: "Rôle mis à jour avec succès",
      role
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Supprimer un rôle (désactivation)
exports.deleteRole = async (req, res) => {
  try {
    // Vérifier si des utilisateurs utilisent ce rôle
    const utilisateurs = await Utilisateur.find({ role: req.params.id });
    
    if (utilisateurs.length > 0) {
      return res.status(400).json({ 
        message: "Impossible de supprimer ce rôle car il est assigné à des utilisateurs" 
      });
    }
    
    // Au lieu de supprimer, nous désactivons le rôle
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { actif: false },
      { new: true }
    );
    
    if (!role) {
      return res.status(404).json({ message: "Rôle non trouvé" });
    }
    
    res.status(200).json({ message: "Rôle désactivé avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Méthode métier 1: Obtenir le nombre d'utilisateurs par rôle
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
          _id: {
            roleId: "$roleInfo._id",
            roleName: "$roleInfo.nom"
          },
          nombreUtilisateurs: { $sum: 1 },
          actifs: {
            $sum: { $cond: [{ $eq: ["$actif", true] }, 1, 0] }
          },
          inactifs: {
            $sum: { $cond: [{ $eq: ["$actif", false] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          roleId: "$_id.roleId",
          roleName: "$_id.roleName",
          nombreUtilisateurs: 1,
          actifs: 1,
          inactifs: 1
        }
      },
      {
        $sort: { nombreUtilisateurs: -1 }
      }
    ]);
    
    res.status(200).json({
      message: "Statistiques des utilisateurs par rôle récupérées avec succès",
      stats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Méthode métier 2: Analyser l'utilisation des permissions
exports.analyserUtilisationPermissions = async (req, res) => {
  try {
    const roles = await Role.find();
    
    const permissionsStats = {};
    
    // Initialiser les statistiques de permissions
    for (const role of roles) {
      Object.keys(role.permissions).forEach(perm => {
        if (!permissionsStats[perm]) {
          permissionsStats[perm] = {
            accordée: 0,
            nonAccordée: 0,
            pourcentageUtilisation: 0,
            rôlesAvecPermission: []
          };
        }
        
        if (role.permissions[perm]) {
          permissionsStats[perm].accordée += 1;
          permissionsStats[perm].rôlesAvecPermission.push({
            id: role._id,
            nom: role.nom
          });
        } else {
          permissionsStats[perm].nonAccordée += 1;
        }
      });
    }
    
    // Calculer les pourcentages d'utilisation
    Object.keys(permissionsStats).forEach(perm => {
      const total = permissionsStats[perm].accordée + permissionsStats[perm].nonAccordée;
      permissionsStats[perm].pourcentageUtilisation = (permissionsStats[perm].accordée / total) * 100;
    });
    
    res.status(200).json({
      message: "Statistiques d'utilisation des permissions récupérées avec succès",
      permissionsStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
