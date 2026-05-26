const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema({

   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
   },

   amount: {
      type: Number
   },

   investmentType: {
      type: String
   },

   startDate: {
      type: Date
   },

   maturityDate: {
      type: Date
   },

   status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active"
   }

}, {
   timestamps: true
});

module.exports = mongoose.model(
   "Investment",
   investmentSchema
);
