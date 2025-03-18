var DF = require("../Models/DeclarationFiscale");

async function addDF(req, res) {
    try {
      const newDF = new DF({
            periode : req.body.periode,
            montantTotal : req.body.montantTotal,
            statut : req.body.statut,
      });
      await newDF.save();
      res.status(200).send("Declaration fiscale added");
    } catch (err) {
      res.status(400).send(err);
    }
  }

    async function getall (req, res) {
      try {
        const getDF = await DF.find();
        res.json(getDF);
      } catch (err) {
        res.status(400).send(err);
      }
    }

    async function getbyid (req, res) {
        try {
          const getoneDF = await DF.findById(req.params.id);
          res.json(getoneDF);
        } catch (err) {
          res.status(400).send(err);
        }
      }

      async function deleteDF (req, res) {
          try {
            const DFdeleted = await DF.findByIdAndDelete(req.params.id);
            res.status(200).send("DF deleted");
          } catch (err) {
            res.status(400).send(err);
          }
        }

         async function updateDF(req, res) {
            try {
              const DFUPDATED = await DF.findByIdAndUpdate(req.params.id, req.body, {
                new: true,});
              res.status(200).json(DFUPDATED);
            } catch (err) {
              res.status(400).send(err);
            }
          }

  module.exports = { addDF ,getall , getbyid ,deleteDF ,updateDF };
  

