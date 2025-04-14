const express = require("express");
const router = express.Router();
const { getDashboardData } = require("../Controller/DashboardController");

router.get("/", getDashboardData);

module.exports = router;