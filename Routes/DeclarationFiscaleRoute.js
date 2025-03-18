var express = require("express");
var route = express.Router();
var DFC = require("../Controller/DeclarationFiscaleController")

route.post("/addDeclaration",DFC.addDF)
route.get("/getallDF",DFC.getall)
route.get("/getDFbyid/:id",DFC.getbyid)
route.delete("/deleteDF/:id",DFC.deleteDF)
route.put("/updateDF/:id",DFC.updateDF)
module.exports = route ;