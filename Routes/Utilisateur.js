var express = require('express');
var route = express.Router();
var UtilisateurController = require ("../Controller/UtilisateurController")

route.post("/add",UtilisateurController.adduser)
route.get("/getall",UtilisateurController.getallusers)
route.get("/getbyid/:id",UtilisateurController.getuserbyid)
route.delete("/delete/:id",UtilisateurController.deleteuser)
route.put("/update/:id",UtilisateurController.updateuser)

module.exports = route;
