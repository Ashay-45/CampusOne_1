const express = require('express');
const router = express.Router();
const StudentProfile = require('../models/StudentProfile');
const { protect } = require('../middleware/auth');

const defaultOpportunities = [
  { company: 'Microsoft', role: 'Software Engineering Intern — Summer 2027', match: '92% Match', location: 'Bengaluru / Hybrid', deadline: 'In 6 days' },
  { company: 'Amazon', role: 'Applied SDE Intern — Cloud Platforms', match: '88% Match', location: 'Hyderabad', deadline: 'In 12 days' },
  { company: 'Atlassian', role: 'Graduate Software Developer', match: '85% Match', location: 'Remote / India', deadline: 'In 18 days' }
];

// @route   GET /api/v1/career/profile
// @desc    Get student career profile, projects, skills, and placement matches
// @access  Protected
router.get('/profile', protect, async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = await StudentProfile.create({
        user: req.user._id,
        roll: req.user.roll || 'CS-2023-042',
        division: req.user.division || 'B.Tech CSE - 6th Sem',
        cgpa: 8.84
      });
    }

    res.status(200).json({
      success: true,
      career: {
        atsScore: profile.atsScore || 84,
        skills: profile.skills,
        projects: profile.projects,
        opportunities: defaultOpportunities
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/v1/career/project
// @desc    Add a technical project to the student portfolio
// @access  Protected
router.post('/project', protect, async (req, res) => {
  try {
    const { title, tech, desc, impact } = req.body;
    if (!title || !tech || !desc) {
      return res.status(400).json({ success: false, message: 'Title, tech stack, and description are required' });
    }

    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await StudentProfile.create({
        user: req.user._id,
        roll: req.user.roll || 'CS-2023-042'
      });
    }

    profile.projects.unshift({ title, tech, desc, impact: impact || 'Completed verified implementation' });
    // Bonus on adding verified project
    profile.atsScore = Math.min(98, (profile.atsScore || 84) + 2);
    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Project added to campus placement portfolio',
      project: profile.projects[0],
      atsScore: profile.atsScore
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/v1/career/scan-ats
// @desc    Re-analyze resume ATS compatibility index
// @access  Protected
router.post('/scan-ats', protect, async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await StudentProfile.create({ user: req.user._id, roll: 'CS-2023-042' });
    }

    // Dynamic ATS calculation based on skill density and projects
    const verifiedSkillsCount = (profile.skills || []).filter(s => s.verified).length;
    const projectCount = (profile.projects || []).length;
    const computedScore = Math.min(96, Math.max(75, 76 + verifiedSkillsCount * 2 + projectCount * 3));

    profile.atsScore = computedScore;
    await profile.save();

    res.status(200).json({
      success: true,
      atsScore: computedScore,
      summary: {
        actionVerbsRate: '95%',
        keywordDensity: '88%',
        verifiedSkills: verifiedSkillsCount,
        showcasedProjects: projectCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
