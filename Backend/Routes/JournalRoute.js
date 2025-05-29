const express = require("express");
const router = express.Router();
const { getJournal } = require("../Controller/JournalController");

router.get("/", getJournal);

module.exports = router;