var express = require("express");
var route = express.Router();
var MSController = require("../Controller/MScontrolleur");

// Modifier les routes pour être cohérent avec le reste de l'API
route.post("/", MSController.addMS);          // POST /MS
route.get("/", MSController.getallMS);       // GET /MS
route.get("/:id", MSController.getbyid);     // GET /MS/:id
route.delete("/:id", MSController.deleteMS); // DELETE /MS/:id
route.put("/:id", MSController.updateMS);    // PUT /MS/:id

module.exports = route;