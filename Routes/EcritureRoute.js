const express = require("express");
const router = express.Router();
const { getEcritures, createEcriture, updateEcriture, deleteEcriture } = require("../Controller/EcritureController");

router.get("/", getEcritures);
router.post("/", createEcriture);
router.put("/:id", updateEcriture);
router.delete("/:id", deleteEcriture);

module.exports = router;