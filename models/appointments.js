const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String, 
    required: true
  },
  withh: {
    type: String, 
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  isVIP: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Appointment', appointmentSchema);
