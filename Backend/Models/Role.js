// models/Role.js

const RoleSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    permissions: [{ type: String }]
});

module.exports = mongoose.model('Role', RoleSchema);
