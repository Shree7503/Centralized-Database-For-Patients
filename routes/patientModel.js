const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    username: String,
    hospitalName: String,
    doctorName: String,
    doctorUsername: String,
    bloodGroup: String,
    location: String,
    department: String,
    admissionDate: Date,
    dischargeDate: Date,
    reasonForVisit: String,
    diagnosis: String,
    procedures: String,
    treatment: String,
    prescription: String,
    uploadedFile: String // You might want to store the file path or URL
});

const Patient = mongoose.model("patient", patientSchema)

module.exports = Patient;