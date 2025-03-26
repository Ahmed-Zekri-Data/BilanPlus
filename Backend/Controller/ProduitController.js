var produit  = require("../Models/Produit")


async function addProduit(req, res) {
    try {
        const newProd = new produit({
            nom: req.body.nom,
            categorie: req.body.categorie,
            prix: req.body.prix,
            stock: req.body.stock
        });
        const savedProduit = await newProd.save();
        res.status(200).json(savedProduit); // Return the saved product as JSON
    } catch (err) {
        res.status(400).send(err);
    }
}

   async function getall (req, res) {
      try {
        const getProduit = await produit.find();
        res.json(getProduit);
      } catch (err) {
        res.status(400).send(err);
      }
    }

  async function getbyid (req, res) {
     try {
       const getunproduit = await produit.findById(req.params.id);
       res.json(getunproduit);
     } catch (err) {
       res.status(400).send(err);
     }
   } 
   async function deleteproduit(req, res) {
    try {
        const produitdeleted = await produit.findByIdAndDelete(req.params.id);
        if (!produitdeleted) {
            return res.status(404).send("Produit non trouvé");
        }
        res.status(204).send(); // Réponse vide avec statut 204 (No Content)
    } catch (err) {
        res.status(400).send(err);
    }
}
     

      async function updateproduit(req, res) {
         try {
           const produitUPDATED = await produit.findByIdAndUpdate(req.params.id, req.body, {
             new: true,});
           res.status(200).json(produitUPDATED);
         } catch (err) {
           res.status(400).send(err);
         }
       }
     

  module.exports ={addProduit,getall,getbyid,deleteproduit,updateproduit}