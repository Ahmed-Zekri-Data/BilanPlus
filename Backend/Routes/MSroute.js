const express = require("express");
const router = express.Router();
const MSController = require("../Controller/MScontrolleur");
const mouvementStockValidators = require("../validators/MouvementStockValidators");

router.post("/", mouvementStockValidators.addMS, MSController.addMS);
router.get("/", MSController.getallMS);
router.get("/:id", mouvementStockValidators.getById, MSController.getbyid);
router.delete("/:id", mouvementStockValidators.deleteMS, MSController.deleteMS);
router.put("/:id", mouvementStockValidators.updateMS, MSController.updateMS);

module.exports = router;