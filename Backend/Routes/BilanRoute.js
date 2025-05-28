const express = require("express");
const router = express.Router();
const { getBilan } = require("../Controller/BilanController");

router.get("/", getBilan);

module.exports = router;