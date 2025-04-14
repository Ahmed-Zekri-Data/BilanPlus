const express = require("express");
const router = express.Router();
const { getResultat } = require("../Controller/ResultatController");

router.get("/", getResultat);

module.exports = router;