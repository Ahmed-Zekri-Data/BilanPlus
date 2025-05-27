var Utilisateur = require("../Models/Utilisateur");


async function addUser(req, res) {
  try {
    console.log('Données reçues:', req.body);
    const newuser = new Utilisateur({
      nom: req.body.nom,
      email: req.body.email,
      motDePasse: req.body.motDePasse,
      role: req.body.role
    });
    const savedUser = await newuser.save();
    console.log('Utilisateur créé:', savedUser);
    res.status(200).json(savedUser); // Réponse JSON avec statut 200
  } catch (err) {
    console.error('Erreur ajout:', err);
    res.status(400).json({ error: err.message });
  }
}

async function getallUsers (req, res) {
    try {
      const getuser = await Utilisateur.find();
      res.json(getuser);
    } catch (err) {
      res.status(400).send(err);
    }
  }

  async function getUserbyid (req, res) {
    try {
      const getoneUser = await Utilisateur.findById(req.params.id);
      res.json(getoneUser);
    } catch (err) {
      res.status(400).send(err);
    }
  }

  async function deleteUser(req, res) {
    try {
      console.log('Suppression demandée pour ID:', req.params.id);
      const Userdeleted = await Utilisateur.findByIdAndDelete(req.params.id);
      if (!Userdeleted) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      console.log('Utilisateur supprimé:', Userdeleted);
      res.status(200).send('User deleted'); // Réponse claire avec statut 200
    } catch (err) {
      console.error('Erreur suppression:', err);
      res.status(400).json({ error: err.message });
    }
  }

  async function updateUser(req, res) {
    try {
      const UserUPDATED = await Utilisateur.findByIdAndUpdate(req.params.id, req.body, {
        new: true,});
      res.status(200).json(UserUPDATED);
    } catch (err) {
      res.status(400).send(err);
    }
  }

module.exports = { addUser ,getallUsers,getUserbyid,updateUser,deleteUser};

  
