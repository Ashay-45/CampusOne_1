const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true
    },
    credits: {
      type: Number,
      required: true,
      default: 3,
      min: 1,
      max: 6
    },
    department: {
      type: String,
      default: 'Computer Science & Engineering',
      trim: true
    },
    semester: {
      type: Number,
      default: 6,
      min: 1,
      max: 8
    },
    syllabusCoverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    room: {
      type: String,
      default: 'Hall 302',
      trim: true
    },
    facultyName: {
      type: String,
      default: 'Dr. Priya Raman',
      trim: true
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Subject', subjectSchema);
