var express = require('express');
var route = express.Router();
var UtilisateurController = require ("../Controller/UtilisateurController")

route.post("/add",UtilisateurController.addUser)
route.get("/getall",UtilisateurController.getallUsers)
route.get("/getbyid/:id",UtilisateurController.getUserbyid)
route.delete("/delete/:id",UtilisateurController.deleteUser)
route.put("/update/:id",UtilisateurController.updateUser)

module.exports = route;
