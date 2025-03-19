var MS  = require("../Models/MouvementStock")

async function addMS(req, res) {
    try {
      const newMS = new MS({
            produit: req.body.produit,
            type : req.body.type,
            quantite : req.body.quantite,
            date: req.body. date
      });
      await newMS.save();
      res.status(200).send("Mouvement added");
    } catch (err) {
      res.status(400).send(err);
    }
  }

   async function getallMS (req, res) {
      try {
        const getMS = await MS.find();
        res.json(getMS);
      } catch (err) {
        res.status(400).send(err);
      }
    }

  async function getbyid (req, res) {
     try {
       const getMS = await MS.findById(req.params.id);
       res.json(getMS);
     } catch (err) {
       res.status(400).send(err);
     }
   } 
   async function deleteMS (req, res) {
       try {
         const MStdeleted = await MS.findByIdAndDelete(req.params.id);
         res.status(200).send("Mouvement deleted");
       } catch (err) {
         res.status(400).send(err);
       }
     }  
     

      async function updateMS(req, res) {
         try {
           const MSUPDATED = await MS.findByIdAndUpdate(req.params.id, req.body, {
             new: true,});
           res.status(200).json(MSUPDATED);
         } catch (err) {
           res.status(400).send(err);
         }
       }


  module.exports ={addMS,getallMS,getbyid,deleteMS,updateMS}