const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  username: {
    type: String
  },
  doctorUsername: {
    type: String,
  },  
  doctorName: {
    type: String,
  },
  medication: {
    type: String,
    required: true,
    trim: true
  },
  genericName: {
    type: String,
    required: true,
    trim: true
  },
  strength: {
    type: String,
    required: true,
    trim: true
  },
  form: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    required: true,
    trim: true
  },
  indication: {
    type: String,
    required: true,
    trim: true
  },
  instructions: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  precautions: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
  }
});

const medication = mongoose.model('Medication', medicationSchema);

module.exports = medication;
