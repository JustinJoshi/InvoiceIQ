const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  invoiceID: {
    type: String,
    required: true,
  },
  note: {
    
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Note", noteSchema);
