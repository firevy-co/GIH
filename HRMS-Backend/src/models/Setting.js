const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({

   companyName: String,

   companyEmail: String,

   companyPhone: String,

   websiteLogo: String,

   maintenanceMode: {
      type: Boolean,
      default: false
   }

}, {
   timestamps: true
});

module.exports = mongoose.model(
   "Setting",
   settingsSchema
);
