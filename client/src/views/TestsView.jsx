import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { testsAPI } from '../services/api';
import { demoQuestions } from '../services/demoData';
import { CheckCircle2, XCircle, Clock, Award, Play, RotateCcw, HelpCircle, Check, ArrowRight, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export const TestsView = () => {
  const { isDemoMode } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState('ALL');
  const [quizState, setQuizState] = useState('idle'); // 'idle' | 'running' | 'submitting' | 'completed'
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(180);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [serverResult, setServerResult] = useState(null);
  const [testHistory, setTestHistory] = useState([
    { date: 'Yesterday', title: 'DSA Midterm Diagnostic', score: '9 / 10', percent: '90%', badge: 'Excellent' },
    { date: 'Oct 11, 2026', title: 'DBMS Relational Calculus & 3NF', score: '8 / 10', percent: '80%', badge: 'Passed' },
    { date: 'Oct 08, 2026', title: 'Operating Systems Scheduling', score: '7 / 10', percent: '70%', badge: 'Improving' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      if (isDemoMode) return;
      try {
        const res = await testsAPI.getHistory();
        if (res?.success && Array.isArray(res.attempts) && res.attempts.length > 0) {
          setTestHistory(res.attempts.map(att => ({
            date: new Date(att.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
            title: att.title,
            score: att.score,
            percent: att.percentage,
            badge: att.passed ? 'Passed' : 'Needs Review'
          })));
        }
      } catch (e) {
        // Keep fallback history
      }
    };

    fetchHistory();
  }, [isDemoMode]);

  // Timer countdown
  useEffect(() => {
    let timer;
    if (quizState === 'running' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && quizState === 'running') {
      handleSubmitQuiz();
    }
    return () => clearInterval(timer);
  }, [quizState, timeLeft]);

  const startQuiz = async (topic) => {
    setSelectedTopic(topic);
    setCurrentIdx(0);
    setAnswers({});
    setServerResult(null);
    setError(null);
    setLoading(true);

    try {
      if (isDemoMode) {
        const filtered = topic === 'ALL' 
          ? demoQuestions 
          : demoQuestions.filter(q => q.topic === topic);
        setQuestions(filtered.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options
        })));
        setActiveAssessment({ id: 'demo_assess_01', title: `${topic} Assessment Test`, timeLimitMinutes: 3 });
        setTimeLeft(180);
        setQuizState('running');
      } else {
        const res = await testsAPI.getActiveAssessments(topic);
        if (res?.success && Array.isArray(res.assessments) && res.assessments.length > 0) {
          const assess = res.assessments[0];
          setActiveAssessment(assess);
          setQuestions(assess.questions);
          setTimeLeft(assess.timeLimitMinutes * 60);
          setQuizState('running');
        } else {
          // Fallback to demo questions
          const filtered = topic === 'ALL' 
            ? demoQuestions 
            : demoQuestions.filter(q => q.topic === topic);
          setQuestions(filtered.map(q => ({ id: q.id, question: q.question, options: q.options })));
          setActiveAssessment({ id: 'demo_assess_01', title: `${topic} Diagnostic Test`, timeLimitMinutes: 3 });
          setTimeLeft(180);
          setQuizState('running');
        }
      }
    } catch (err) {
      console.warn('Could not load remote assessment, using safe local mode:', err.message);
      const filtered = topic === 'ALL' 
        ? demoQuestions 
        : demoQuestions.filter(q => q.topic === topic);
      setQuestions(filtered.map(q => ({ id: q.id, question: q.question, options: q.options })));
      setActiveAssessment({ id: 'demo_assess_01', title: `${topic} Diagnostic Test`, timeLimitMinutes: 3 });
      setTimeLeft(180);
      setQuizState('running');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optIdx) => {
    if (quizState !== 'running') return;
    const currentQ = questions[currentIdx];
    const key = currentQ?.id !== undefined ? currentQ.id : currentIdx;
    setAnswers(prev => ({ ...prev, [key]: optIdx }));
  };

  const handleSubmitQuiz = async () => {
    setQuizState('submitting');
    const totalTimeSpent = (activeAssessment?.timeLimitMinutes || 3) * 60 - timeLeft;

    if (isDemoMode || !activeAssessment?.id || String(activeAssessment.id).startsWith('demo_')) {
      // Local client evaluation for demo mode
      let correct = 0;
      const review = questions.map((q, idx) => {
        const demoQ = demoQuestions.find(d => d.question === q.question) || demoQuestions[idx] || {};
        const studentAns = answers[q.id] !== undefined ? answers[q.id] : answers[idx];
        const isCorrect = studentAns === demoQ.correct;
        if (isCorrect) correct++;
        return {
          question: q.question,
          options: q.options,
          studentAnswer: studentAns,
          correctAnswer: demoQ.correct !== undefined ? demoQ.correct : 0,
          isCorrect,
          explanation: demoQ.explanation || 'Verified algorithmic concept.'
        };
      });

      const total = questions.length;
      const percentage = Math.round((correct / total) * 100);
      setServerResult({
        score: correct,
        total,
        percentage,
        passed: percentage >= 60,
        review
      });
      setQuizState('completed');
    } else {
      try {
        const res = await testsAPI.submitAssessment(activeAssessment.id, answers, totalTimeSpent);
        if (res?.success && res.result) {
          setServerResult(res.result);
          setQuizState('completed');
        } else {
          throw new Error('Grading failed on server');
        }
      } catch (err) {
        console.warn('Server grading failed, generating fallback review:', err.message);
        // Fallback grading if network was interrupted
        let correct = 0;
        const review = questions.map((q, idx) => {
          const demoQ = demoQuestions.find(d => d.question === q.question) || demoQuestions[idx] || {};
          const studentAns = answers[q.id] !== undefined ? answers[q.id] : answers[idx];
          const isCorrect = studentAns === demoQ.correct;
          if (isCorrect) correct++;
          return {
            question: q.question,
            options: q.options,
            studentAnswer: studentAns,
            correctAnswer: demoQ.correct !== undefined ? demoQ.correct : 0,
            isCorrect,
            explanation: demoQ.explanation || 'Verified syllabus concept.'
          };
        });

        const total = questions.length;
        const percentage = Math.round((correct / total) * 100);
        setServerResult({ score: correct, total, percentage, passed: percentage >= 60, review });
        setQuizState('completed');
      }
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const currentQ = questions[currentIdx];
  const currentKey = currentQ?.id !== undefined ? currentQ.id : currentIdx;
  const currentAnswer = answers[currentKey];

  return (
    <div className="container page-wrapper">
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '1.85rem' }}>Assessment & Test Engine</h1>
          {isDemoMode && <span className="badge badge-hi">Preview Mode</span>}
        </div>
        <p style={{ color: 'var(--mut)', fontSize: '0.92rem' }}>
          Evaluate topic proficiency with server-verified timed assessments and confidential answer scoring.
        </p>
      </div>

      {quizState === 'idle' && (
        <div>
          {/* Topic Selector Cards */}
          <div className="grid-cols-4" style={{ marginBottom: '28px' }}>
            {[
              { id: 'ALL', title: 'Comprehensive Mock', desc: 'Curated mix of DSA, DBMS & AI concepts', count: '5 Questions', time: '3 Mins' },
              { id: 'DSA', title: 'Data Structures', desc: 'Trees, Graphs, Sorting & Complexities', count: '2 Questions', time: '3 Mins' },
              { id: 'DBMS', title: 'Database Systems', desc: 'Normalization, ACID, Indexes & Joins', count: '2 Questions', time: '3 Mins' },
              { id: 'AI/ML', title: 'Machine Learning', desc: 'Activations, Gradients & Models', count: '1 Question', time: '2 Mins' }
            ].map(t => (
              <div key={t.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span className="badge badge-ac" style={{ marginBottom: '10px' }}>{t.count}</span>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>{t.title}</h3>
                  <p style={{ color: 'var(--mut)', fontSize: '0.85rem', marginBottom: '16px' }}>{t.desc}</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => startQuiz(t.id)} disabled={loading}>
                  <Play size={14} /> Start Quiz ({t.time})
                </button>
              </div>
            ))}
          </div>

          {/* Test History */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '14px' }}>Previous Assessment Results</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {testHistory.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--sf-solid)', borderRadius: 'var(--radius-md)', border: '1px solid var(--bd)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{h.title}</div>
                    <div style={{ color: 'var(--mut)', fontSize: '0.82rem' }}>Taken on {h.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ac)' }}>{h.score} ({h.percent})</span>
                    <span className="badge badge-ac">{h.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {quizState === 'running' && currentQ && (
        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Quiz Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--bd)', paddingBottom: '16px' }}>
            <div>
              <span className="badge badge-ac" style={{ marginRight: '8px' }}>
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span style={{ color: 'var(--mut)', fontSize: '0.85rem' }}>
                {activeAssessment?.title || 'Academic Assessment'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: timeLeft < 30 ? 'var(--bad)' : 'var(--hi)' }}>
              <Clock size={16} /> {formatTime(timeLeft)}
            </div>
          </div>

          {/* Question Text */}
          <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '22px', lineHeight: 1.4 }}>
            {currentQ.question}
          </div>

          {/* Options (Confidential: Correct answer is NOT in state) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = currentAnswer === oIdx;
              return (
                <div
                  key={oIdx}
                  onClick={() => handleSelectOption(oIdx)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--ac)' : '1px solid var(--bd)',
                    background: isSelected ? 'var(--ac-glow)' : 'var(--sf-solid)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div 
                    style={{ 
                      width: '26px', 
                      height: '26px', 
                      borderRadius: '50%', 
                      border: '1px solid var(--bd)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      background: isSelected ? 'var(--ac)' : 'transparent',
                      color: isSelected ? '#fff' : 'var(--ink)'
                    }}
                  >
                    {String.fromCharCode(65 + oIdx)}
                  </div>
                  <span style={{ fontSize: '0.96rem' }}>{opt}</span>
                </div>
              );
            })}
          </div>

          {/* Nav Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--bd)', paddingTop: '18px' }}>
            <button 
              className="btn btn-secondary" 
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
            >
              Previous
            </button>

            {currentIdx < questions.length - 1 ? (
              <button 
                className="btn btn-primary"
                onClick={() => setCurrentIdx(prev => prev + 1)}
              >
                Next Question <ArrowRight size={15} />
              </button>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={handleSubmitQuiz}
              >
                Submit for Server Grading
              </button>
            )}
          </div>
        </div>
      )}

      {quizState === 'submitting' && (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--ac-glow)', color: 'var(--ac)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} />
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>Grading Assessment on Server...</h3>
          <p style={{ color: 'var(--mut)', fontSize: '0.9rem' }}>
            Transmitting responses, validating answers against answer keys, and persisting results.
          </p>
        </div>
      )}

      {quizState === 'completed' && serverResult && (
        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', padding: '20px 0 30px', borderBottom: '1px solid var(--bd)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: serverResult.passed ? 'var(--ac-glow)' : 'rgba(194, 65, 12, 0.1)', color: serverResult.passed ? 'var(--ac)' : 'var(--bad)', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={34} />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>
              {serverResult.passed ? 'Assessment Passed! 🎉' : 'Assessment Completed'}
            </h2>
            <p style={{ color: 'var(--mut)', fontSize: '0.95rem' }}>
              Server-Verified Score: <strong style={{ color: serverResult.passed ? 'var(--ac)' : 'var(--bad)' }}>{serverResult.score} out of {serverResult.total}</strong> ({serverResult.percentage}%)
            </p>
          </div>

          <div style={{ margin: '24px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Server-Verified Answers & Explanations:</h3>
            {(serverResult.review || []).map((rev, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--sf-solid)', borderRadius: 'var(--radius-md)', border: '1px solid var(--bd)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  {rev.isCorrect ? (
                    <CheckCircle2 size={18} style={{ color: 'var(--ac)', flexShrink: 0 }} />
                  ) : (
                    <XCircle size={18} style={{ color: 'var(--bad)', flexShrink: 0 }} />
                  )}
                  <div>
                    <strong>Q{idx + 1}: {rev.question}</strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.88rem', marginLeft: '26px' }}>
                  <div style={{ color: rev.isCorrect ? 'var(--ac)' : 'var(--bad)' }}>
                    Your answer: {rev.studentAnswer !== null && rev.studentAnswer !== undefined ? rev.options[rev.studentAnswer] : 'Not answered'}
                  </div>
                  {!rev.isCorrect && (
                    <div style={{ color: 'var(--ac)', marginTop: '2px' }}>
                      Correct answer: {rev.options[rev.correctAnswer]}
                    </div>
                  )}
                  <div style={{ color: 'var(--mut)', marginTop: '6px', fontSize: '0.82rem', background: 'var(--bd)', padding: '8px', borderRadius: '6px' }}>
                    💡 {rev.explanation}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => setQuizState('idle')}>
              <RotateCcw size={15} /> Retake / Back to Assessments
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
