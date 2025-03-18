const express = require("express");
const router = express.Router();
const { getComptes, createCompte, updateCompte, deleteCompte } = require("../Controller/CompteController");

router.get("/", getComptes);
router.post("/", createCompte);
router.put("/:id", updateCompte);
router.delete("/:id", deleteCompte);

module.exports = router;