const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  file: {

  },
  aiResponse: {

  },
  isManualEntry: {
    type: Boolean,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Invoice", invoiceSchema);
