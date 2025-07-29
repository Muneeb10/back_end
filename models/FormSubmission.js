const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  fullName: String,
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  service: String,
  subject: String,
  message: {
    type: String,
    maxlength: 500
  }
}, { timestamps: true });



module.exports = mongoose.model('FormSubmission', formSchema);
