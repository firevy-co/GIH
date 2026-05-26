const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({

   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
   },

   title: {
      type: String
   },

   documentUrl: {
      type: String
   },

   documentType: {
      type: String
   },

   signed: {
      type: Boolean,
      default: false
   },

   uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
   }

}, {
   timestamps: true
});

module.exports = mongoose.model(
   "Document",
   documentSchema
);
