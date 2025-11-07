const mongoose = require('mongoose');

const attendanceWindowSchema = new mongoose.Schema({
  startTime: Date,
  endTime: Date,
  createdBy: String
});

module.exports = mongoose.model('AttendanceWindow', attendanceWindowSchema);

