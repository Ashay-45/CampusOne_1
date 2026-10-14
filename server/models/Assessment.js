const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question prompt is required'],
    trim: true
  },
  options: {
    type: [String],
    required: [true, 'At least 2 options are required'],
    validate: [v => Array.isArray(v) && v.length >= 2, 'Options must have at least 2 choices']
  },
  correct: {
    type: Number,
    required: [true, 'Correct option index is required'],
    min: 0
  },
  explanation: {
    type: String,
    required: [true, 'Explanation is required for answer review'],
    trim: true
  }
});

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true
    },
    topic: {
      type: String,
      required: true,
      enum: ['DSA', 'DBMS', 'AI/ML', 'OS', 'ALL'],
      default: 'ALL'
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    timeLimitMinutes: {
      type: Number,
      default: 5,
      min: 1,
      max: 60
    },
    passingPercentage: {
      type: Number,
      default: 60,
      min: 0,
      max: 100
    },
    questions: [questionSchema],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
