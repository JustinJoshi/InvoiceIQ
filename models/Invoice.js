const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  file: {

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

module.exports = mongoose.model("Invoice", chartSchema);
