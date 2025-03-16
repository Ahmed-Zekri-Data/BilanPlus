var TVA  = require("../Models/TVA")


async function addTVA(req, res) {
    try {
      const newTVA = new TVA({
            taux : req.body.taux,
            montant : req.body.montant,
            declaration : req.body.declaration,
      });
      await newTVA.save();
      res.status(200).send("TVA added");
    } catch (err) {
      res.status(400).send(err);
    }
  }

  async function getall (req, res) {
    try {
      const getTVA = await TVA.find();
      res.json(getTVA);
    } catch (err) {
      res.status(400).send(err);
    }
  }

  async function getbyid (req, res) {
    try {
      const getonetva = await TVA.findById(req.params.id);
      res.json(getonetva);
    } catch (err) {
      res.status(400).send(err);
    }
  }

  async function deleteTVA (req, res) {
    try {
      const TVAdeleted = await TVA.findByIdAndDelete(req.params.id);
      res.status(200).send("TVA deleted");
    } catch (err) {
      res.status(400).send(err);
    }
  }

  async function updateTVA(req, res) {
    try {
      const TVAUPDATED = await TVA.findByIdAndUpdate(req.params.id, req.body, {
        new: true,});
      res.status(200).json(TVAUPDATED);
    } catch (err) {
      res.status(400).send(err);
    }
  }


  module.exports ={addTVA, getall,getbyid,deleteTVA,updateTVA}