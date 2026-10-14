// CampusOne Topic Catalog & Question Generator Utility

const rawCatalog = {
  DSA: `Arrays=stores elements in contiguous memory with O(1) index access
Strings=a sequence of characters, immutable in many languages
Linked Lists=nodes connected by pointers, with O(1) insertion at a known node
Stacks=a LIFO structure with push and pop
Queues=a FIFO structure with enqueue and dequeue
Trees=a hierarchy of nodes with parent-child links
BST=left subtree smaller, right subtree larger, inorder traversal is sorted
Graphs=vertices connected by edges, directed or weighted
BFS=explores level by level using a queue
DFS=explores deep along a path using a stack or recursion
Sorting=arranges elements in order, comparison sorts need O(n log n)
Searching=binary search halves a sorted range at each step
Greedy=picks the locally best choice at every step
Backtracking=builds a solution and undoes choices at dead ends
Dynamic Programming=stores overlapping subproblem results to avoid recomputation
Recursion=a function that calls itself and needs a base case
Time Complexity=how running time grows as input size increases
Space Complexity=how extra memory grows as input size increases
Debugging=finding and fixing the cause of incorrect behaviour`,
  DBMS: `ER Model=models entities, attributes and relationships
Keys=attributes that uniquely identify rows
Normalization=organises tables to reduce redundancy
1NF=every column holds atomic values
2NF=removes partial dependencies on a composite key
3NF=removes transitive dependencies
BCNF=every determinant must be a candidate key
SQL=a declarative language to query and manage relational data
Joins=combine rows from tables using related columns
Subqueries=a query nested inside another query
Transactions=a unit of work that is committed or rolled back
ACID=atomicity, consistency, isolation and durability
Concurrency=controls simultaneous transactions using locks or timestamps
Indexing=a structure that speeds up lookups at the cost of slower writes
Functional Dependencies=one attribute set determines another`,
  'AI/ML': `Artificial Intelligence=machines performing tasks that need human-like intelligence
Machine Learning=learns patterns from data instead of explicit rules
Supervised Learning=trains on labelled input-output examples
Unsupervised Learning=finds structure in unlabelled data
Reinforcement Learning=an agent learns from rewards and penalties
Linear Regression=predicts a continuous value with a fitted line
Logistic Regression=predicts class probability using the sigmoid function
Decision Trees=split data using feature-based rules
Random Forest=averages many decision trees trained on random subsets
KNN=classifies by majority vote of the nearest neighbours
SVM=finds the maximum-margin separating hyperplane
Naive Bayes=applies Bayes theorem assuming independent features
K-Means=clusters data around k centroids
Neural Networks=layers of weighted neurons with activation functions
Deep Learning=neural networks with many hidden layers
CNN=uses convolution filters and suits images
RNN=processes sequences by carrying a hidden state
LSTM=uses gates to remember long-term sequence information
Overfitting=low training error but high test error
Underfitting=high error on both training and test data
Bias=error from overly simple model assumptions
Variance=sensitivity of a model to changes in the training data
Precision=true positives divided by predicted positives
Recall=true positives divided by actual positives
F1 Score=the harmonic mean of precision and recall`,
  'Computer Networks': `OSI=a seven-layer reference model for networking
TCP/IP=the four-layer protocol suite used on the internet
IPv4=32-bit addressing written in dotted decimal
IPv6=128-bit addressing that solves address exhaustion
Subnetting=splits a network into smaller networks using a mask
Routing=chooses paths for packets between networks
TCP=reliable, connection-oriented delivery with handshakes
UDP=fast, connectionless delivery without guarantees
DNS=translates domain names into IP addresses
DHCP=assigns IP addresses automatically to hosts
HTTP=the request-response protocol of the web
HTTPS=HTTP secured with TLS encryption
SMTP=the protocol used to send email
NAT=translates private addresses to public addresses
Switching=forwards frames using MAC addresses`,
  'Software Engineering': `SDLC=structured phases from requirements to maintenance
Waterfall=sequential phases with little room for change
Agile=iterative delivery with continuous feedback
Scrum=sprints, a backlog and daily stand-ups
Requirements=what the system must do and the constraints on it
Testing=checks software against expected behaviour
Architecture=the high-level structure of components and their relations
Design=plans modules and interfaces before coding
Maintenance=fixing and improving software after release
Risk Management=identifies, assesses and mitigates project risks`,
  'Operating Systems': `Processes=programs in execution with their own address space
Threads=lightweight units of execution sharing process memory
CPU Scheduling=decides which ready process runs next
Deadlock=processes wait forever for each other's resources
Paging=divides memory into fixed-size pages and frames
Virtual Memory=lets programs use more memory than physical RAM`,
  'Computer Organization': `CPU=fetches, decodes and executes instructions
ALU=performs arithmetic and logic operations
Registers=the fastest small storage inside the processor
Cache=small fast memory that exploits locality of reference
Pipelining=overlaps instruction stages to raise throughput`,
  'Web Development': `HTML=defines the structure of web pages
CSS=controls styling and layout
JavaScript=adds behaviour and interactivity in the browser
React=builds user interfaces from reusable components
REST API=uses HTTP methods on resources
State Management=keeps UI data consistent across components`,
  'Cloud Computing': `IaaS=rents raw compute, storage and networking
PaaS=provides a platform to deploy apps without managing servers
SaaS=delivers ready-to-use software over the internet
Containers=package an app with dependencies and share the host kernel`,
  'Probability & Statistics': `Probability=measures how likely an event is, from 0 to 1
Normal Distribution=a symmetric bell curve defined by mean and standard deviation
Mean=the average of the values
Standard Deviation=the square root of the variance`
};

const CAT = {};
for (const [c, s] of Object.entries(rawCatalog)) {
  CAT[c] = {};
  s.split('\n').forEach(l => {
    const i = l.indexOf('=');
    if (i !== -1) CAT[c][l.slice(0, i).trim()] = l.slice(i + 1).trim();
  });
}

const courses = Object.keys(CAT);
const allTopics = () => [...new Set(Object.values(CAT).flatMap(o => Object.keys(o)))];

const pick = a => a[Math.floor(Math.random() * a.length)];
const shuf = a => [...a].sort(() => Math.random() - 0.5);
const ds = (c, t, d, k) => shuf(d === 'Easy'
  ? Object.entries(CAT).filter(([x]) => x !== c).flatMap(([, o]) => Object.entries(o))
  : Object.entries(CAT[c] || {}).filter(([x]) => x !== t)
).slice(0, k);

const ATYPES = ['Quiz', 'Topic Test', 'Skill Test', 'Coding Assessment', 'Mock Interview'];
const QTYPES = ['MCQ', 'Multiple Correct', 'True/False', 'Fill in the Blank', 'Short Answer', 'Scenario Based', 'Code Output', 'Debugging', 'Programming', 'Numerical', 'Case Study', 'Match the Following'];

function makeQ(c, t, d, T) {
  const p = (CAT[c] && CAT[c][t]) || 'Core computer science principle and methodology';
  const m = { Easy: 1, Medium: 2, Hard: 3 }[d] || 2;
  const e = `${t}: ${p}.`;
  const topics = Object.keys(CAT[c] || {});
  const others = () => shuf(topics.filter(x => x !== t)).slice(0, 3);
  let q, o = null, a, x = null;

  const opt = (arr, r) => {
    const s = shuf(arr);
    o = s;
    a = s.indexOf(r);
  };

  switch (T) {
    case 'MCQ':
      q = d === 'Hard' ? `Which description accurately characterizes ${t}? Choose the best answer.` : `Which description matches ${t}?`;
      opt([p, ...ds(c, t, d, 3).map(z => z[1])], p);
      break;
    case 'Multiple Correct': {
      const w = (ds(c, t, d, 1)[0] || ['Other', 'Distractor'])[0];
      const A = `${t}: ${p}`;
      const B = `${t} is an essential concept studied in ${c}`;
      const s = shuf([A, B, `${w}: ${p}`, `${t} has no relevance to ${c}`]);
      q = `Select all statements that are true about ${t} (${c}).`;
      o = s;
      a = [s.indexOf(A), s.indexOf(B)].sort();
      break;
    }
    case 'True/False': {
      const tr = Math.random() < 0.5;
      q = `True or false: ${t}: ${tr ? p : (ds(c, t, d, 1)[0] || ['', 'is an unrelated concept'])[1]}.`;
      o = ['True', 'False'];
      a = tr ? 0 : 1;
      break;
    }
    case 'Fill in the Blank':
      q = `____: ${p}. Fill in the blank with the appropriate topic name.`;
      a = [t.toLowerCase()];
      break;
    case 'Short Answer':
      q = `In one or two concise sentences, explain the significance of ${t} in ${c}.`;
      a = [t.toLowerCase()];
      break;
    case 'Scenario Based':
      q = `A software engineering requirement demands a ${c} technique where: "${p}". Which concept best applies?`;
      opt([t, ...others()], t);
      break;
    case 'Case Study':
      q = `Case study: An engineering team working in ${c} must solve a bottleneck where "${p}". Which concept should they implement?`;
      opt([t, ...others()], t);
      break;
    case 'Numerical': {
      const mk = pick([2, 3, 4]), cr = 6 + Math.floor(Math.random() * 4), w = 1 + Math.floor(Math.random() * 3), r = cr * mk - w;
      q = `A ${t} technical assessment awards ${mk} marks per correct answer and deducts 1 per wrong answer. A student gets ${cr} correct and ${w} incorrect. What is the net score?`;
      opt([String(r), String(r + mk), String(r - 1), String(cr * mk)], String(r));
      break;
    }
    default:
      q = `Which statement is accurate for ${t}?`;
      opt([p, ...ds(c, t, d, 3).map(z => z[1])], p);
      break;
  }
  return [c, t, d, T, q, o, a, e, m, x];
}

const TYPES = {
  Quiz: ['MCQ', 'True/False', 'Fill in the Blank', 'Multiple Correct'],
  'Topic Test': ['MCQ', 'True/False', 'Multiple Correct', 'Short Answer'],
  'Skill Test': QTYPES,
  'Coding Assessment': ['MCQ', 'Short Answer', 'Scenario Based'],
  'Mock Interview': ['Short Answer', 'Scenario Based', 'Case Study']
};

function buildQs(t) {
  const ty = TYPES[t.type] || ['MCQ', 'True/False'];
  const out = [];
  const used = new Set();
  const cs = Object.keys(CAT);

  for (let g = 0; out.length < (t.n || 5) && g < 300; g++) {
    const c = t.course || pick(t.topic ? cs.filter(z => CAT[z][t.topic]) : cs);
    const tp = (CAT[c] && CAT[c][t.topic]) ? t.topic : pick(Object.keys(CAT[c] || {}));
    const q = makeQ(c, tp, t.diff || pick(['Easy', 'Medium', 'Hard']), t.qt || pick(ty));
    if (q && !used.has(q[4])) {
      used.add(q[4]);
      out.push(q);
    }
  }
  return shuf(out);
}

module.exports = {
  rawCatalog,
  CAT,
  courses,
  allTopics,
  makeQ,
  buildQs,
  ATYPES,
  QTYPES
};
