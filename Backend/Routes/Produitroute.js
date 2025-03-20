var express = require("express");
var route = express.Router();
var PRODController = require ("../Controller/ProduitController")

route.post("/addProduit",PRODController.addProduit)
route.get("/getall",PRODController.getall)
route.get("/getbyid/:id",PRODController.getbyid)
route.delete("/deleteproduit/:id",PRODController.deleteproduit)
route.put("/updateproduit/:id",PRODController.updateproduit)
module.exports = route;