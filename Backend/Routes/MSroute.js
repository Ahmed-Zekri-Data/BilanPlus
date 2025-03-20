var express = require("express");
var route = express.Router();
var MSController = require ("../Controller/MScontrolleur")

route.post("/addMS",MSController.addMS)
route.get("/getallMS",MSController.getallMS)
route.get("/getbyid/:id",MSController.getbyid)
route.delete("/deleteMS/:id",MSController.deleteMS)
route.put("/updateMS/:id",MSController.updateMS)
module.exports = route;