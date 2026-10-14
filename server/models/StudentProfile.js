const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  verified: { type: Boolean, default: false }
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  tech: { type: String, required: true, trim: true },
  desc: { type: String, required: true, trim: true },
  impact: { type: String, default: '', trim: true }
});

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    roll: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    division: {
      type: String,
      default: 'B.Tech CSE - 6th Sem',
      trim: true
    },
    batch: {
      type: String,
      default: 'CS-6A',
      trim: true
    },
    cgpa: {
      type: Number,
      default: 8.5,
      min: 0,
      max: 10
    },
    atsScore: {
      type: Number,
      default: 84,
      min: 0,
      max: 100
    },
    skills: {
      type: [skillSchema],
      default: [
        { name: 'JavaScript / React', level: 'Advanced', verified: true },
        { name: 'Node.js & Express', level: 'Intermediate', verified: true },
        { name: 'MongoDB / Mongoose', level: 'Advanced', verified: true },
        { name: 'Data Structures & Algorithms', level: 'Advanced', verified: true },
        { name: 'Docker / CI/CD', level: 'Beginner', verified: false },
        { name: 'System Design', level: 'Intermediate', verified: false }
      ]
    },
    projects: {
      type: [projectSchema],
      default: [
        {
          title: 'Distributed Real-Time Messaging Engine',
          tech: 'React, Node.js, WebSockets, Redis',
          desc: 'Architected high-throughput chat platform serving 5k concurrent connections with sub-40ms latency.',
          impact: 'Reduced server memory footprint by 32% using Redis pub/sub'
        },
        {
          title: 'Automated Code Plagiarism Classifier',
          tech: 'Python, AST Parsing, TF-IDF, Flask',
          desc: 'Built static analysis tool for computer science department to detect semantic similarities in student assignments.',
          impact: 'Processed 1,200 student submissions with 96% classification accuracy'
        }
      ]
    },
    enrolledSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
