const mongoose = require("mongoose");


const appointmentSchema = new mongoose.Schema({
    username: String,
    name: String,
    doctorName: String,
    problem: String,
    date: Date,
});

const appointment = mongoose.model("appointment", appointmentSchema);

module.exports = appointment;