var Utilisateur = require("../Models/Utilisateur");


async function addUser(req, res) {
    try {
      const newuser = new Utilisateur({
            nom : req.body.nom,
            email : req.body.email,
            motDePasse : req.body.motDePasse,
      });
      await newuser.save();
      res.status(200).send("useradd");
    } catch (err) {
      res.status(400).send(err);
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
      const getoneUser = await TVA.findById(req.params.id);
      res.json(getoneUser);
    } catch (err) {
      res.status(400).send(err);
    }
  }

  async function deleteUser (req, res) {
    try {
      const Userdeleted = await Utilisateur.findByIdAndDelete(req.params.id);
      res.status(200).send("User deleted");
    } catch (err) {
      res.status(400).send(err);
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

  
