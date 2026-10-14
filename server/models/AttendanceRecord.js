const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttendanceSession',
      required: true,
      index: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      index: true
    },
    status: {
      type: String,
      enum: ['present', 'absent'],
      required: true,
      default: 'present'
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index: Ensure a student has exactly one record per session
attendanceRecordSchema.index({ session: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
