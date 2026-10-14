const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Subject = require('../models/Subject');
const Assessment = require('../models/Assessment');

const defaultUsers = [
  {
    name: 'Aarav Sharma',
    firstName: 'Aarav',
    lastName: 'Sharma',
    email: 'aarav.sharma@campusone.edu',
    password: 'Campus@2024',
    role: 'student',
    roll: 'CS-2023-042',
    division: 'B.Tech CSE - 6th Sem',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true
  },
  {
    name: 'Dr. Priya Raman',
    firstName: 'Priya',
    lastName: 'Raman',
    email: 'priya.raman@campusone.edu',
    password: 'Campus@2024',
    role: 'teacher',
    employeeId: 'EMP-FAC-889',
    division: 'Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    subjectsHandled: ['CS-601', 'CS-602', 'CS-603', 'CS-604', 'CS-605', 'Data Structures & Algorithms', 'Database Systems'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isActive: true
  },
  {
    name: 'Campus Administrator',
    firstName: 'Admin',
    lastName: 'Office',
    email: 'admin@campusone.edu',
    password: 'Campus@2024',
    role: 'admin',
    adminId: 'ADMIN-ROOT-01',
    division: 'Academic Administration',
    department: 'Academic Administration',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    isActive: true
  }
];

async function ensureDefaultUsers() {
  try {
    for (const u of defaultUsers) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create(u);
        if (process.env.NODE_ENV !== 'test') {
          console.log(`🌱 Seeded institutional user: ${u.email} (${u.role})`);
        }
      }

      // If student, ensure StudentProfile exists
      if (user.role === 'student') {
        let profile = await StudentProfile.findOne({ user: user._id });
        if (!profile) {
          await StudentProfile.create({
            user: user._id,
            roll: user.roll || 'CS-2023-042',
            division: user.division || 'B.Tech CSE - 6th Sem',
            cgpa: 8.84,
            atsScore: 84,
            skills: [
              { name: 'Data Structures & Algorithms', level: 'Advanced', verified: true },
              { name: 'JavaScript & React', level: 'Advanced', verified: true },
              { name: 'Node.js & Express', level: 'Intermediate', verified: true },
              { name: 'MongoDB & SQL', level: 'Intermediate', verified: true }
            ],
            projects: [
              {
                title: 'CampusOne Unified Academic Platform',
                tech: 'React, Node.js, Express, MongoDB, Web Workers',
                desc: 'Full-stack educational learning system with sandboxed code execution and authoritative server-side grading.',
                impact: 'Deployed live for university batch cohort'
              }
            ]
          });
        }
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('⚠️ User auto-seeding warning:', err.message);
    }
  }
}

// Standalone execution: node utils/seedData.js
if (require.main === module) {
  const dotenv = require('dotenv');
  dotenv.config();
  const { connectDB } = require('../config/db');

  (async () => {
    console.log('🌱 Connecting to database to seed default evaluation personas...');
    await connectDB();
    await ensureDefaultUsers();
    console.log('✅ Institutional evaluation personas seeded successfully.');
    await mongoose.connection.close();
    process.exit(0);
  })();
}

module.exports = { ensureDefaultUsers, defaultUsers };
