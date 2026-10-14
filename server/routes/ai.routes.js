const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route   POST /api/v1/ai/chat
// @desc    CampusOne AI Academic & Career Copilot chat endpoint
// @access  Protected
router.post('/chat', protect, (req, res) => {
  try {
    const { message, context = {} } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message prompt is required' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message exceeds maximum allowable length of 2000 characters.' });
    }

    const query = message.toLowerCase();
    let reply = '';
    const studentName = req.user.firstName || req.user.name || 'Scholar';
    const cgpa = typeof context.cgpa === 'number' ? context.cgpa : 8.84;

    if (query.includes('knapsack') || query.includes('dynamic programming') || query.includes('dp')) {
      reply = `**0/1 Knapsack Problem — Algorithmic Breakdown:**\n\n1. **Optimal Substructure:** At each item \`i\`, either include it (if capacity \`w >= weight[i]\`) or exclude it.\n2. **State Equation:** \`dp[i][w] = max(dp[i-1][w], value[i] + dp[i-1][w - weight[i]])\`\n3. **Space Optimization:** Can be reduced from O(N×W) to O(W) using a 1D array filled in reverse.\n\n*Try implementing this directly in the Code Hub!*`;
    } else if (query.includes('attendance') || query.includes('os') || query.includes('bunk')) {
      reply = `**Attendance Strategy for ${studentName}:**\n- Your statutory university threshold is **75%**.\n- For courses currently near the threshold (e.g. CS-603 Operating Systems at 73.3%), attending the next **2 consecutive sessions** restores compliance.\n- Use the dynamic simulator on your Academics tab to project different attendance scenarios.`;
    } else if (query.includes('sql') || query.includes('interview') || query.includes('dbms')) {
      reply = `**Key SQL Interview Concepts for SDE Roles:**\n1. **Window Functions:** \`DENSE_RANK()\` and \`ROW_NUMBER()\` for salary rankings.\n2. **Aggregations:** Grouping with \`HAVING\` clause filters after aggregation.\n3. **Indexing Strategy:** B-Tree indexing vs. Hash indexing trade-offs on high-write tables.\n4. **ACID Guarantees:** Isolation levels (Read Committed vs. Serializable) and phantom reads.`;
    } else if (query.includes('resume') || query.includes('placement') || query.includes('ats')) {
      reply = `**Resume Optimization for ${studentName} (CGPA: ${cgpa}):**\n- Your current ATS score is **84/100**.\n- Highlight metrics in your project descriptions (e.g. *“Reduced latency by 32%”*, *“Serving 5k concurrent WebSocket connections”*).\n- Ensure your verified GitHub project links and Docker/CI-CD competencies are featured prominently.`;
    } else {
      reply = `Hello ${studentName}! I analyzed your query regarding **"${message}"** in the context of your 6th-semester coursework (DSA, DBMS, OS, Full-Stack). With your solid ${cgpa} CGPA, focusing on rigorous algorithmic proofs alongside full-stack system architecture will position you exceptionally well for upcoming campus drives.`;
    }

    res.status(200).json({
      success: true,
      message: reply,
      metadata: {
        provider: 'campusone-rule-engine',
        isModelGenerated: false,
        engine: 'Deterministic Academic Decision Rules v1.0'
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
