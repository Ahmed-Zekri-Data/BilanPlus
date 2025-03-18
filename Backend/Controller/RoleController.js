var Utilisateur = require("../Models/Role");


async function addRole(req, res) {
    try {
      const newRole = new Utilisateur({
            nom : req.body.nom,
            email : req.body.email,
            motDePasse : req.body.motDePasse,
      });
      await newRole.save();
      res.status(200).send("Roleadd");
    } catch (err) {
      res.status(400).send(err);
    }
  }

async function getallRoles (req, res) {
    try {
      const getRole = await Utilisateur.find();
      res.json(getRole);
    } catch (err) {
      res.status(400).send(err);
    }
  }

  async function getRolebyid (req, res) {
    try {
      const getoneRole = await Utilisateur.findById(req.params.id);
      res.json(getoneRole);
    } catch (err) {
      res.status(400).send(err);
    }
  }

  async function deleteRole (req, res) {
    try {
      const Roledeleted = await Utilisateur.findByIdAndDelete(req.params.id);
      res.status(200).send("Role deleted");
    } catch (err) {
      res.status(400).send(err);
    }
  }

  async function updateRole(req, res) {
    try {
      const RoleUPDATED = await Utilisateur.findByIdAndUpdate(req.params.id, req.body, {
        new: true,});
      res.status(200).json(RoleUPDATED);
    } catch (err) {
      res.status(400).send(err);
    }
  }

module.exports = { addRole ,getallRoles,getRolebyid,updateRole,deleteRole};

  
