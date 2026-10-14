import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../services/api';
import { Bot, Send, Sparkles, User, RefreshCw, Zap, Bookmark, ThumbsUp } from 'lucide-react';

export const AiAssistantView = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: `Hello ${user?.firstName || user?.name || 'Scholar'}! I am CampusOne AI, your academic & career mentor. I have context on your 6th-semester coursework (DSA, DBMS, OS, Web Dev) and your current 8.84 CGPA. How can I help you excel today?`,
      timestamp: '10:00 AM'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    'Explain 0/1 Knapsack with memoization',
    'How do I raise my OS attendance above 75%?',
    'Top 5 SQL queries asked in FAANG interviews',
    'Generate a 4-week GATE / Placement study schedule'
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await aiAPI.chat(query, {
        semester: 6,
        cgpa: user?.cgpa || 8.84,
        department: user?.department || 'Computer Science'
      });

      if (res?.success && res.message) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'assistant',
            text: res.message,
            timestamp: res.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsTyping(false);
      } else {
        generateLocalResponse(query);
      }
    } catch (e) {
      generateLocalResponse(query);
    }
  };

  const generateLocalResponse = (query) => {
    let replyText = '';
    const lower = query.toLowerCase();

    if (lower.includes('knapsack') || lower.includes('dynamic programming')) {
      replyText = `**0/1 Knapsack Problem — Intuition & Memoization:**\n\n1. **State Definition:** \`dp[i][w]\` represents maximum value attainable considering items up to index \`i\` with remaining weight capacity \`w\`.\n2. **Recurrence Relation:**\n   - Exclude item: \`dp[i][w] = dp[i-1][w]\`\n   - Include item (if \`weight[i] <= w\`): \`dp[i][w] = max(dp[i-1][w], value[i] + dp[i-1][w - weight[i]])\`\n3. **Time Complexity:** O(N * W), compared to O(2^N) brute force.\n\n*Would you like to solve this right now in the Code Hub?*`;
    } else if (lower.includes('attendance') || lower.includes('os')) {
      replyText = `**Attendance Strategy for CS-603 (Operating Systems):**\n- Current attendance: **22 / 30 classes = 73.3%** (Deficit of 2 classes).\n- To reach **75%**, attend the next **2 lectures** consecutively.\n- To reach **80%**, attend the next **10 lectures** without absence.\n- Recommendation: Prioritize Wednesday's OS Concurrency lab!`;
    } else if (lower.includes('sql') || lower.includes('interview')) {
      replyText = `**Top 5 SQL Interview Patterns for SDE Roles:**\n1. Finding Nth highest salary using \`DENSE_RANK() OVER (ORDER BY salary DESC)\`\n2. Identifying duplicate records using \`GROUP BY ... HAVING COUNT(*) > 1\`\n3. Self-joins for Manager-Employee reporting trees\n4. Cumulative running totals using \`SUM() OVER (ORDER BY date)\`\n5. Handling NULLs gracefully with \`COALESCE()\` and outer joins.`;
    } else {
      replyText = `Great question regarding **${query}**! As you are in 6th semester with a strong 8.84 CGPA, focusing on algorithmic depth alongside system design principles will maximize your placement outcomes. Let me know if you would like me to generate practice MCQs or code templates.`;
    }

    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + 1,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setIsTyping(false);
  };

  return (
    <div className="container page-wrapper">
      <div className="glass-card" style={{ height: 'calc(100vh - 170px)', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--bd)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--sf)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--ac)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>CampusOne AI Mentor</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--ac)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ac)' }}></span>
                Context Active (Sem VI • B.Tech CSE • CGPA {user?.cgpa || 8.84})
              </span>
            </div>
          </div>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setMessages([{ id: 1, sender: 'assistant', text: `Session cleared. How else can I assist you today, ${user?.firstName || user?.name || 'Scholar'}?`, timestamp: 'Just now' }])}
          >
            <RefreshCw size={14} /> Clear History
          </button>
        </div>

        {/* Message Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
          {messages.map((m) => (
            <div key={m.id} className={`chat-msg ${m.sender === 'user' ? 'user' : ''}`}>
              <div 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: m.sender === 'user' ? 'var(--ac)' : 'var(--hi)', 
                  color: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {m.sender === 'user' ? <User size={16} /> : <Sparkles size={16} />}
              </div>

              <div className={`chat-bubble ${m.sender}`}>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                  {m.text}
                </div>
                <div style={{ fontSize: '0.72rem', opacity: 0.7, marginTop: '6px', textAlign: m.sender === 'user' ? 'right' : 'left' }}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-msg">
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--hi)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} />
              </div>
              <div className="chat-bubble assistant" style={{ fontStyle: 'italic', color: 'var(--mut)' }}>
                CampusOne AI is synthesizing response...
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts Bar */}
        <div style={{ padding: '8px 20px', display: 'flex', gap: '8px', overflowX: 'auto', borderTop: '1px solid var(--bd)', background: 'var(--sf)' }}>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
              onClick={() => handleSend(p)}
            >
              <Zap size={12} style={{ color: 'var(--hi)' }} /> {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--bd)', background: 'var(--sf-solid)' }}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{ display: 'flex', gap: '10px' }}
          >
            <input
              type="text"
              className="input-field"
              placeholder="Ask anything about DSA, DBMS, attendance, career roadmap or exam prep..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={!input.trim()}>
              <Send size={16} /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
