import React, { useState } from 'react';
import { mockCodingProblems } from '../services/api';
import { executeInSandbox } from '../services/codeRunner';
import { Code, Play, CheckCircle2, XCircle, Terminal, RefreshCw, Sparkles, BookOpen, ShieldCheck, AlertTriangle } from 'lucide-react';

const problemConfigs = {
  p1: {
    fnName: 'twoSum',
    testCases: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1], inputDisplay: 'nums = [2,7,11,15], target = 9' },
      { args: [[3, 2, 4], 6], expected: [1, 2], inputDisplay: 'nums = [3,2,4], target = 6' }
    ]
  },
  p2: {
    fnName: 'isValid',
    testCases: [
      { args: ['()'], expected: true, inputDisplay: 's = "()"' },
      { args: ['()[]{}'], expected: true, inputDisplay: 's = "()[]{}"' },
      { args: ['(]'], expected: false, inputDisplay: 's = "(]"' }
    ]
  },
  p3: {
    fnName: 'lengthOfLongestSubstring',
    testCases: [
      { args: ['abcabcbb'], expected: 3, inputDisplay: 's = "abcabcbb"' },
      { args: ['bbbbb'], expected: 1, inputDisplay: 's = "bbbbb"' }
    ]
  }
};

export const CodingHubView = () => {
  const [selectedProblem, setSelectedProblem] = useState(mockCodingProblems[0]);
  const [code, setCode] = useState(mockCodingProblems[0].starterCode);
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleSelectProblem = (p) => {
    setSelectedProblem(p);
    setCode(p.starterCode);
    setTestResults(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setTestResults(null);

    const config = problemConfigs[selectedProblem.id] || {
      fnName: selectedProblem.starterCode.match(/function\s+(\w+)/)?.[1] || 'solution',
      testCases: []
    };

    try {
      const outcome = await executeInSandbox(code, config.fnName, config.testCases);
      setTestResults(outcome);
    } catch (err) {
      setTestResults({
        error: `Sandbox execution failed: ${err.message}`,
        passed: false
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container page-wrapper">
      {/* Title */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.85rem' }}>DSA Code Hub & Problem Simulator</h1>
            <span className="badge badge-ac" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} /> Web Worker Sandboxed
            </span>
          </div>
          <p style={{ color: 'var(--mut)', fontSize: '0.92rem' }}>
            Practice algorithmic patterns with automated test cases and infinite-loop timeout protection.
          </p>
        </div>
      </div>

      <div className="grid-1-2" style={{ alignItems: 'flex-start' }}>
        {/* Left Column: Problem Catalog */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Problems Catalog</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mockCodingProblems.map((p) => {
              const isSelected = selectedProblem.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectProblem(p)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1px solid var(--ac)' : '1px solid var(--bd)',
                    background: isSelected ? 'var(--ac-glow)' : 'var(--sf-solid)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{p.title}</span>
                    <span className="badge badge-ac" style={{ fontSize: '0.72rem' }}>{p.difficulty}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--mut)' }}>
                    <span>{p.category}</span>
                    <span>Acceptance: {p.acceptance}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Editor & Runner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Problem Statement Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-neutral">{selectedProblem.category}</span>
              <span className="badge badge-ac">{selectedProblem.difficulty}</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{selectedProblem.title}</h2>
            <p style={{ color: 'var(--ink)', fontSize: '0.94rem', lineHeight: 1.5, marginBottom: '14px' }}>
              {selectedProblem.description}
            </p>

            <div style={{ fontSize: '0.85rem', color: 'var(--mut)' }}>
              <strong>Sample Input: </strong> <code>{selectedProblem.testCases[0]?.input}</code>
            </div>
          </div>

          {/* Code Editor */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', background: 'var(--sf-solid)', borderBottom: '1px solid var(--bd)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: 600 }}>
                <Terminal size={16} /> solution.js (JavaScript Node / ES6)
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setCode(selectedProblem.starterCode)}>
                <RefreshCw size={12} /> Reset Starter
              </button>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
              style={{
                width: '100%',
                height: '240px',
                padding: '16px',
                background: '#0d1312',
                color: '#4CC2AB',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.9rem',
                border: 'none',
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.6
              }}
            />

            <div style={{ padding: '12px 18px', background: 'var(--sf)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--bd)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--mut)' }}>
                Protected against infinite loops (2000ms execution cap)
              </span>
              <button className="btn btn-primary" onClick={handleRunCode} disabled={isRunning}>
                <Play size={15} /> {isRunning ? 'Running in Sandbox...' : 'Run in Sandbox'}
              </button>
            </div>
          </div>

          {/* Execution Results */}
          {testResults && (
            <div className="glass-card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                {testResults.passed ? (
                  <>
                    <CheckCircle2 size={20} style={{ color: 'var(--ac)' }} />
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--ac)' }}>Accepted — All Test Cases Passed!</h3>
                  </>
                ) : (
                  <>
                    <XCircle size={20} style={{ color: 'var(--bad)' }} />
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--bad)' }}>Execution Failed</h3>
                  </>
                )}
              </div>

              {testResults.error ? (
                <div style={{ color: 'var(--bad)', fontSize: '0.88rem', background: 'rgba(194, 65, 12, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid var(--bad)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '2px' }}>
                    <AlertTriangle size={15} /> Error Output:
                  </div>
                  {testResults.error}
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.84rem', color: 'var(--mut)', marginBottom: '12px' }}>
                    <span>Runtime: <strong>{testResults.runtime}</strong></span>
                    <span>Memory: <strong>{testResults.memory}</strong></span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {testResults.cases.map((c, i) => (
                      <div key={i} style={{ padding: '8px 12px', background: 'var(--sf-solid)', borderRadius: '6px', border: '1px solid var(--bd)', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span>Test Case #{i + 1}</span>
                          <span style={{ color: c.passed ? 'var(--ac)' : 'var(--bad)', fontWeight: 600 }}>
                            {c.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                        <div style={{ color: 'var(--mut)', fontSize: '0.78rem' }}>
                          Input: <code>{c.input}</code> | Expected: <code>{c.expected}</code> | Output: <code>{c.actual}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
