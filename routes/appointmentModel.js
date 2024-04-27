const mongoose = require("mongoose");


const appointmentSchema = new mongoose.Schema({
    username: String,
    hospitalName: String,
    doctorName: String,
    problem: String,
    date: Date,
    time: String,
});

const appointment = mongoose.model("appointment", appointmentSchema);

module.exports = appointment;