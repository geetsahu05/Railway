const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now // Automatically set to current date
  },
  name: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  leavingDate: {
    type: Date,
    required: true
  },
  comingDate: {
    type: Date,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  goingTo: {
    type: String,
    required: true
  },
  leaveOrDuty: {
    type: String,
    enum: ['Leave', 'Duty'],
    required: true
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

module.exports = mongoose.model('Tour', tourSchema);
