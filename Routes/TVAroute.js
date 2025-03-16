var express = require("express");
var route = express.Router();
var TVAController = require ("../Controller/TVAController")

route.post("/addTVA",TVAController.addTVA)
route.get("/getallTVA",TVAController.getall)
route.get("/getTVAbyid/:id",TVAController.getbyid)
route.delete("/deleteTVA/:id",TVAController.deleteTVA)
route.put("/updateTVA/:id",TVAController.updateTVA)
module.exports = route;