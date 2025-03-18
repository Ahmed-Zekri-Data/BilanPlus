// models/Role.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema
const Role = new Schema({
    nom: { type: String, required: true },
    permissions: [{ type: String }]
});

module.exports = mongoose.model('Role', Role);




