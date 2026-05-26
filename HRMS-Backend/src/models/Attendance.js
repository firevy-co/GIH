const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({

   employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee"
   },

   date: {
      type: Date,
      default: Date.now
   },

   checkIn: {
      type: String
   },

   checkOut: {
      type: String
   },

   status: {
      type: String,
      enum: ["present", "absent", "half-day"],
      default: "present"
   },

   location: {
      type: String
   }

}, {
   timestamps: true
});

module.exports = mongoose.model(
   "Attendance",
   attendanceSchema
);
