const express = require("express");
const router = express.Router();
const { getBalance } = require("../Controller/BalanceController");

router.get("/", getBalance);

module.exports = router;