const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

const patientSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String
});

patientSchema.plugin(plm);

module.exports = mongoose.model("patient", patientSchema);