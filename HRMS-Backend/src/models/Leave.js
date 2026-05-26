const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({

   employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee"
   },

   leaveType: {
      type: String,
      enum: ["casual", "sick", "paid"]
   },

   fromDate: {
      type: Date
   },

   toDate: {
      type: Date
   },

   reason: {
      type: String
   },

   status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
   }

}, {
   timestamps: true
});

module.exports = mongoose.model("Leave", leaveSchema);
