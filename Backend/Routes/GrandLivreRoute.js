const express = require("express");
const router = express.Router();
const { getGrandLivre } = require("../Controller/GrandLivreController");

router.get("/", getGrandLivre);

module.exports = router;