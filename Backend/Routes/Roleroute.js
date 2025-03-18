var express = require('express');
var route = express.Router();
var RoleController = require ("../Controller/RoleController");

route.post("/add",RoleController.addRole)
route.get("/getall",RoleController.getallRoles)
route.get("/getbyid/:id",RoleController.getRolebyid)
route.delete("/delete/:id",RoleController.deleteRole)
route.put("/update/:id",RoleController.updateRole)

module.exports = route;
