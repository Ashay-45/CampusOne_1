const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true
    },
    subjectCode: {
      type: String,
      trim: true
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    batch: {
      type: String,
      default: 'CS-6A',
      trim: true
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    topic: {
      type: String,
      default: 'Regular Course Lecture',
      trim: true
    },
    sessionType: {
      type: String,
      enum: ['lecture', 'lab', 'tutorial'],
      default: 'lecture'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
