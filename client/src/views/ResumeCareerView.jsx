import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { careerAPI } from '../services/api';
import { FileText, Award, CheckCircle2, AlertCircle, Briefcase, Plus, ExternalLink, Sparkles, Download, X } from 'lucide-react';

const fallbackSkills = [
  { name: 'JavaScript / React', level: 'Advanced', verified: true },
  { name: 'Node.js & Express', level: 'Intermediate', verified: true },
  { name: 'MongoDB / Mongoose', level: 'Advanced', verified: true },
  { name: 'Data Structures & Algorithms', level: 'Advanced', verified: true },
  { name: 'Docker / CI/CD', level: 'Beginner', verified: false },
  { name: 'System Design', level: 'Intermediate', verified: false }
];

const fallbackProjects = [
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
];

const defaultOpportunities = [
  { company: 'Microsoft', role: 'Software Engineering Intern — Summer 2027', match: '92% Match', location: 'Bengaluru / Hybrid', deadline: 'In 6 days' },
  { company: 'Amazon', role: 'Applied SDE Intern — Cloud Platforms', match: '88% Match', location: 'Hyderabad', deadline: 'In 12 days' },
  { company: 'Atlassian', role: 'Graduate Software Developer', match: '85% Match', location: 'Remote / India', deadline: 'In 18 days' }
];

export const ResumeCareerView = () => {
  const { user } = useAuth();
  const [atsScore, setAtsScore] = useState(84);
  const [skills, setSkills] = useState(fallbackSkills);
  const [projects, setProjects] = useState(fallbackProjects);
  const [opportunities, setOpportunities] = useState(defaultOpportunities);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTech, setNewTech] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImpact, setNewImpact] = useState('');
  const [toast, setToast] = useState('');

  const fetchCareerData = async () => {
    try {
      const res = await careerAPI.getProfile();
      if (res?.success && res.career) {
        if (res.career.atsScore) setAtsScore(res.career.atsScore);
        if (Array.isArray(res.career.skills) && res.career.skills.length > 0) setSkills(res.career.skills);
        if (Array.isArray(res.career.projects) && res.career.projects.length > 0) setProjects(res.career.projects);
        if (Array.isArray(res.career.opportunities)) setOpportunities(res.career.opportunities);
      }
    } catch (e) {
      console.warn('Career profile offline, using cached state:', e.message);
    }
  };

  useEffect(() => {
    fetchCareerData();
  }, [user]);

  const handleReanalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await careerAPI.scanAts();
      if (res?.success && res.atsScore) {
        setAtsScore(res.atsScore);
        setToast(`✅ Server ATS Scan complete: Score updated to ${res.atsScore}/100.`);
      }
      setAnalyzing(false);
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      setToast('⚠️ ' + err.message);
      setAnalyzing(false);
      setTimeout(() => setToast(''), 4000);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newTitle || !newTech || !newDesc) return;

    try {
      const res = await careerAPI.addProject({
        title: newTitle,
        tech: newTech,
        desc: newDesc,
        impact: newImpact
      });
      if (res?.success) {
        setProjects([res.project, ...projects]);
        if (res.atsScore) setAtsScore(res.atsScore);
        setToast('✅ Project saved and persisted to MongoDB placement portfolio.');
      }
      setShowAddModal(false);
      setNewTitle('');
      setNewTech('');
      setNewDesc('');
      setNewImpact('');
    } catch (err) {
      setToast('⚠️ ' + err.message);
    } finally {
      setTimeout(() => setToast(''), 4000);
    }
  };

  return (
    <div className="container page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.85rem' }}>Resume & Career Development Hub</h1>
          </div>
          <p style={{ color: 'var(--mut)', fontSize: '0.92rem' }}>
            ATS score optimization, technical skill inventory, and tailored internship matchmaking.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleReanalyze} disabled={analyzing}>
          <Sparkles size={16} /> {analyzing ? 'Scanning Resume ATS...' : 'Run ATS AI Scan'}
        </button>
      </div>

      {toast && (
        <div style={{ padding: '12px 18px', background: 'var(--ac-glow)', color: 'var(--ac)', borderRadius: 'var(--radius-md)', border: '1px solid var(--ac)', marginBottom: '18px', fontWeight: 600 }}>
          {toast}
        </div>
      )}

      <div className="grid-2-1">
        {/* Left Column: ATS Score & Projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* ATS Gauge Card */}
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div 
                style={{ 
                  width: '76px', 
                  height: '76px', 
                  borderRadius: '50%', 
                  background: 'var(--ac-glow)', 
                  border: '3px solid var(--ac)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--ac)', lineHeight: 1 }}>{atsScore}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--mut)', textTransform: 'uppercase' }}>/ 100</span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '1.25rem' }}>ATS Compatibility Index</h3>
                  <span className="badge badge-ac">Top Tier Candidate</span>
                </div>
                <p style={{ color: 'var(--mut)', fontSize: '0.88rem', maxWidth: '420px' }}>
                  Your resume emphasizes quantifiable metrics, MERN stack skills, and algorithmic proficiency.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ac)' }}>
                <CheckCircle2 size={15} /> Action verbs & metrics: 95%
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ac)' }}>
                <CheckCircle2 size={15} /> Skills keyword density: 88%
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--hi)' }}>
                <AlertCircle size={15} /> Add Cloud Certifications (+4 pts)
              </div>
            </div>
          </div>

          {/* Project Portfolio */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Verified Technical Projects</h3>
                <span style={{ color: 'var(--mut)', fontSize: '0.84rem' }}>Showcased on campus placement portfolio</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(true)}>
                <Plus size={14} /> Add Project
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {projects.map((p, i) => (
                <div key={i} style={{ padding: '16px', background: 'var(--sf-solid)', borderRadius: 'var(--radius-md)', border: '1px solid var(--bd)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '1.05rem' }}>{p.title}</h4>
                    <span className="badge badge-neutral">{p.tech}</span>
                  </div>
                  <p style={{ color: 'var(--mut)', fontSize: '0.88rem', lineHeight: 1.45, marginBottom: '8px' }}>
                    {p.desc}
                  </p>
                  <div style={{ fontSize: '0.82rem', color: 'var(--ac)', fontWeight: 600 }}>
                    💡 Result: {p.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Skills & Placement Match */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Skill Inventory */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Technical Skill Inventory</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {skills.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--sf-solid)', borderRadius: '8px', border: '1px solid var(--bd)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {s.verified ? <CheckCircle2 size={16} style={{ color: 'var(--ac)' }} /> : <AlertCircle size={16} style={{ color: 'var(--mut)' }} />}
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{s.name}</span>
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.74rem' }}>{s.level}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Placement Openings */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Briefcase size={18} style={{ color: 'var(--hi)' }} />
              <h3 style={{ fontSize: '1.15rem' }}>Campus Placement Matches</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {opportunities.map((o, i) => (
                <div key={i} style={{ padding: '12px 14px', background: 'var(--sf-solid)', borderRadius: 'var(--radius-md)', border: '1px solid var(--bd)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.94rem' }}>{o.company}</strong>
                    <span className="badge badge-ac">{o.match}</span>
                  </div>
                  <div style={{ color: 'var(--ink)', fontSize: '0.86rem', marginBottom: '4px' }}>{o.role}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--mut)' }}>
                    <span>{o.location}</span>
                    <span style={{ color: 'var(--bad)', fontWeight: 600 }}>{o.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Add Technical Project</h3>
              <button className="icon-btn" onClick={() => setShowAddModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleAddProject}>
              <div className="input-group">
                <label className="input-label">Project Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Distributed Task Scheduler" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  required 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Tech Stack</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Node.js, Redis, Docker, React" 
                  value={newTech} 
                  onChange={(e) => setNewTech(e.target.value)} 
                  required 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Architecture / Description</label>
                <textarea 
                  className="input-field" 
                  rows="3" 
                  placeholder="Explain key architectural decisions and problem solved..."
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)} 
                  required 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Measurable Impact / Result</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Improved throughput by 45% with sub-50ms latency" 
                  value={newImpact} 
                  onChange={(e) => setNewImpact(e.target.value)} 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Save Project to Portfolio
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
