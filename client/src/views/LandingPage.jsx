import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Code2, 
  Bot, 
  FileText, 
  TrendingUp, 
  ArrowRight, 
  Menu, 
  X, 
  ShieldCheck, 
  Check, 
  Laptop, 
  Compass,
  Award,
  Layers
} from 'lucide-react';

export const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const featureCards = [
    {
      icon: <BookOpen size={22} />,
      title: 'Academics',
      description: 'Streamlined course timetables, faculty rosters, curriculum syllabi, and official attendance compliance tracking.'
    },
    {
      icon: <CheckCircle2 size={22} />,
      title: 'Assessments',
      description: 'Objective evaluations and timed tests with authoritative server-side grading, question breakdowns, and review sheets.'
    },
    {
      icon: <Code2 size={22} />,
      title: 'Code Hub',
      description: 'In-browser JavaScript coding sandbox executed securely inside isolated Web Workers with automated test suites.'
    },
    {
      icon: <Bot size={22} />,
      title: 'AI Mentor',
      description: 'Curriculum-aligned academic assistant providing conceptual explanations, study roadmaps, and instant clarification.'
    },
    {
      icon: <FileText size={22} />,
      title: 'Resume & Career',
      description: 'ATS-compatible resume keyword analyzer, technical skill scoring, portfolio project showcase, and job readiness index.'
    },
    {
      icon: <TrendingUp size={22} />,
      title: 'Progress Tracking',
      description: 'Continuous institutional metric monitoring across attendance minimums, academic benchmarks, and skill milestones.'
    }
  ];

  const workflowSteps = [
    {
      step: '1',
      title: 'Create your account.',
      description: 'Sign up with your educational email and access your secure personalized academic environment.'
    },
    {
      step: '2',
      title: 'Learn and practice.',
      description: 'Attend lectures, solve coding problems in Code Hub, complete assessments, and consult your AI Mentor.'
    },
    {
      step: '3',
      title: 'Track your growth.',
      description: 'Monitor attendance compliance, evaluate your ATS career score, and build an exceptional academic portfolio.'
    }
  ];

  return (
    <div id="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* =====================================================================
          A. NAVBAR
          ===================================================================== */}
      <header className="landing-nav-wrapper">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-nav-logo" aria-label="CampusOne Home">
            <div className="landing-logo-badge">
              <Sparkles size={18} />
            </div>
            <span>Campus<i>One</i></span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="landing-menu-desktop" aria-label="Primary Navigation">
            <button type="button" onClick={() => scrollToSection('home')} className="landing-nav-link">
              Home
            </button>
            <button type="button" onClick={() => scrollToSection('features')} className="landing-nav-link">
              Features
            </button>
            <button type="button" onClick={() => scrollToSection('how-it-works')} className="landing-nav-link">
              How It Works
            </button>
            <button type="button" onClick={() => scrollToSection('about')} className="landing-nav-link">
              About
            </button>
            <button type="button" onClick={() => scrollToSection('contact')} className="landing-nav-link">
              Contact
            </button>
          </nav>

          {/* Auth Actions */}
          <div className="landing-auth-actions">
            <Link to="/login" className="btn btn-secondary btn-sm" id="nav-login-btn">
              Log In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm" id="nav-register-btn">
              Get Started
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              type="button"
              className="mobile-menu-btn" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-drawer" role="navigation" aria-label="Mobile Navigation">
            <button type="button" onClick={() => scrollToSection('home')} className="landing-nav-link" style={{ textAlign: 'left' }}>
              Home
            </button>
            <button type="button" onClick={() => scrollToSection('features')} className="landing-nav-link" style={{ textAlign: 'left' }}>
              Features
            </button>
            <button type="button" onClick={() => scrollToSection('how-it-works')} className="landing-nav-link" style={{ textAlign: 'left' }}>
              How It Works
            </button>
            <button type="button" onClick={() => scrollToSection('about')} className="landing-nav-link" style={{ textAlign: 'left' }}>
              About
            </button>
            <button type="button" onClick={() => scrollToSection('contact')} className="landing-nav-link" style={{ textAlign: 'left' }}>
              Contact
            </button>
            <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--bd)' }}>
              <Link to="/login" className="btn btn-secondary" style={{ flex: 1 }}>Log In</Link>
              <Link to="/register" className="btn btn-primary" style={{ flex: 1 }}>Get Started</Link>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================================
          B. HERO SECTION
          ===================================================================== */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            {/* Left Content */}
            <div>
              <div className="hero-badge-tag">
                <ShieldCheck size={14} />
                <span>Modern Institutional Learning Platform</span>
              </div>

              <h1 className="hero-headline">
                Your Campus. Your Skills. <span>Your Future.</span>
              </h1>

              <p className="hero-subtext">
                One platform to manage academics, develop practical skills, prepare for your career, and track your growth.
              </p>

              <div className="hero-cta-group">
                <Link to="/register" className="btn btn-primary btn-lg" id="hero-get-started-btn">
                  Get Started
                  <ArrowRight size={18} />
                </Link>
                <button 
                  type="button"
                  onClick={() => scrollToSection('features')} 
                  className="btn btn-secondary btn-lg"
                  id="hero-explore-features-btn"
                >
                  Explore Features
                </button>
              </div>

              <p className="hero-supporting-line">
                Learn better. Build skills. Get career-ready.
              </p>
            </div>

            {/* Right Illustration: Polished Generic Static Product Preview */}
            <div className="hero-preview-frame" aria-label="CampusOne Generic Platform Preview">
              <div className="preview-header-bar">
                <div className="preview-dot-group" aria-hidden="true">
                  <div className="preview-dot" />
                  <div className="preview-dot" />
                  <div className="preview-dot" />
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--mut)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} />
                  <span>Integrated Academic Workspace</span>
                </div>
              </div>

              <div className="preview-cards-stack">
                {/* Generic Curricular Progress Card */}
                <div className="preview-mini-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--ac-subtle)', color: 'var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)' }}>Curriculum Schedule</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--mut)' }}>Computer Science & Engineering</div>
                    </div>
                  </div>
                  <span className="badge badge-ac">6 Active Modules</span>
                </div>

                {/* Generic Assessment Diagnostic Card */}
                <div className="preview-mini-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--ac-subtle)', color: 'var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)' }}>Objective Assessment</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--mut)' }}>Data Structures & Algorithms</div>
                    </div>
                  </div>
                  <span className="badge badge-ac">Authoritative Grading</span>
                </div>

                {/* Generic Code Sandbox Card */}
                <div className="preview-mini-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--ac-subtle)', color: 'var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Code2 size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)' }}>Code Hub Sandbox</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--mut)' }}>Isolated Web Worker Execution</div>
                    </div>
                  </div>
                  <span className="badge badge-ac">Test Verification</span>
                </div>

                {/* Generic ATS Career Readiness Card */}
                <div className="preview-mini-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--hi-subtle)', color: '#9A6615', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Award size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)' }}>Career & Resume Index</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--mut)' }}>ATS Keyword Matching & Portfolio</div>
                    </div>
                  </div>
                  <span className="badge badge-hi">Career Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          C. FEATURES SECTION (6 Cards based on working capabilities)
          ===================================================================== */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Core Capabilities</span>
            <h2 className="section-title">Designed for Complete Academic Excellence</h2>
            <p className="section-subtitle">
              CampusOne unifies course delivery, hands-on skill development, and career preparation in one cohesive environment.
            </p>
          </div>

          <div className="features-grid">
            {featureCards.map((feat, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon-box">
                  {feat.icon}
                </div>
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-desc">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          D. HOW IT WORKS SECTION (3 Steps)
          ===================================================================== */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Simple Entry Flow</span>
            <h2 className="section-title">How CampusOne Works</h2>
            <p className="section-subtitle">
              From enrollment to career transition, a transparent three-step journey.
            </p>
          </div>

          <div className="steps-grid">
            {workflowSteps.map((stepItem, index) => (
              <div key={index} className="step-card">
                <div className="step-number" aria-hidden="true">{stepItem.step}</div>
                <h3 className="step-title">Step {stepItem.step}: {stepItem.title}</h3>
                <p className="step-desc">{stepItem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          ABOUT SECTION
          ===================================================================== */}
      <section id="about" style={{ padding: '80px 0', background: 'var(--sf)', borderTop: '1px solid var(--bd)', borderBottom: '1px solid var(--bd)' }}>
        <div className="container">
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <span className="section-label">About CampusOne</span>
            <h2 className="section-title" style={{ marginBottom: '18px' }}>Empowering Tomorrow's Engineers & Educators</h2>
            <p style={{ color: 'var(--mut)', fontSize: '1.05rem', lineHeight: '1.65', marginBottom: '24px' }}>
              CampusOne is an academic technology platform purpose-built for colleges and universities. We bridge the gap between textbook theory, real-time code execution, and placement preparedness—ensuring every student reaches their full potential with verified records and faculty oversight.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--ink)', fontWeight: 600, fontSize: '0.92rem' }}>
                <Check size={18} color="var(--ac)" /> Strict Role-Based Privacy
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--ink)', fontWeight: 600, fontSize: '0.92rem' }}>
                <Check size={18} color="var(--ac)" /> Authoritative Server Grading
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--ink)', fontWeight: 600, fontSize: '0.92rem' }}>
                <Check size={18} color="var(--ac)" /> Isolated Client Code Execution
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          E. FINAL CALL TO ACTION
          ===================================================================== */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-banner">
            <h2 className="cta-headline">Ready to take control of your learning journey?</h2>
            <p className="cta-subtext">
              Join thousands of students and faculty members collaborating, learning, and tracking growth on CampusOne.
            </p>
            <Link to="/register" className="btn-cta" id="cta-register-btn">
              Create Your Account
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          F. FOOTER
          ===================================================================== */}
      <footer id="contact" className="landing-footer">
        <div className="container">
          <div className="footer-grid">
            {/* Branding Column */}
            <div>
              <div className="footer-brand-title">CampusOne</div>
              <p className="footer-desc">
                The unified educational platform for academics, technical assessments, isolated coding practice, and career portfolio advancement.
              </p>
            </div>

            {/* Platform Navigation */}
            <div>
              <div className="footer-heading">Platform</div>
              <ul className="footer-links">
                <li><button type="button" onClick={() => scrollToSection('features')} className="footer-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Academics</button></li>
                <li><button type="button" onClick={() => scrollToSection('features')} className="footer-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Assessments</button></li>
                <li><button type="button" onClick={() => scrollToSection('features')} className="footer-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Code Hub</button></li>
                <li><button type="button" onClick={() => scrollToSection('features')} className="footer-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>AI Mentor</button></li>
                <li><button type="button" onClick={() => scrollToSection('features')} className="footer-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Resume & Career</button></li>
              </ul>
            </div>

            {/* Access & Portals */}
            <div>
              <div className="footer-heading">Portals</div>
              <ul className="footer-links">
                <li><Link to="/login" className="footer-link">Student Login</Link></li>
                <li><Link to="/login" className="footer-link">Faculty Portal</Link></li>
                <li><Link to="/login" className="footer-link">Administrator Console</Link></li>
                <li><Link to="/register" className="footer-link">Student Registration</Link></li>
              </ul>
            </div>

            {/* Institutional Contact & Legal */}
            <div>
              <div className="footer-heading">Institution & Contact</div>
              <ul className="footer-links">
                <li style={{ color: 'var(--footer-mut)', fontSize: '0.9rem' }}>CampusOne Educational Systems</li>
                <li><a href="mailto:support@campusone.edu" className="footer-link">support@campusone.edu</a></li>
                <li style={{ color: 'var(--footer-mut)', fontSize: '0.9rem' }}>Privacy & Data Compliance</li>
                <li style={{ color: 'var(--footer-mut)', fontSize: '0.9rem' }}>Role-Based Access Control (RBAC)</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div>&copy; {new Date().getFullYear()} CampusOne Education Technologies. All rights reserved.</div>
            <div>Strict Role Isolation &bull; Authoritative Evaluation &bull; Secure Academic Cloud</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
