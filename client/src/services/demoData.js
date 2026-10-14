// CampusOne Explicit Demo / Offline Data Provider
// Used ONLY when explicit demo mode is active or during offline visual component testing.

export const demoQuestions = [
  {
    id: 1,
    topic: 'DSA',
    question: 'What is the worst-case time complexity of QuickSort?',
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    correct: 2,
    explanation: 'QuickSort exhibits O(n²) worst-case time when bad pivots are chosen (e.g. already sorted array with leftmost pivot).'
  },
  {
    id: 2,
    topic: 'DSA',
    question: 'Which data structure is naturally used for Breadth First Search (BFS)?',
    options: ['Stack', 'Queue', 'Priority Queue', 'Binary Tree'],
    correct: 1,
    explanation: 'BFS explores vertices level by level, requiring FIFO order provided by a Queue.'
  },
  {
    id: 3,
    topic: 'DBMS',
    question: 'Which normal form eliminates transitive functional dependencies?',
    options: ['1NF', '2NF', '3NF', 'BCNF'],
    correct: 2,
    explanation: '3NF requires that no non-prime attribute is transitively dependent on the primary key.'
  },
  {
    id: 4,
    topic: 'DBMS',
    question: 'In ACID properties of transactions, what does the "I" stand for?',
    options: ['Index', 'Isolation', 'Integrity', 'Immutability'],
    correct: 1,
    explanation: 'Isolation ensures concurrent transaction execution produces state equivalent to serial execution.'
  },
  {
    id: 5,
    topic: 'AI/ML',
    question: 'Which activation function is most susceptible to the vanishing gradient problem in deep networks?',
    options: ['ReLU', 'Leaky ReLU', 'Sigmoid', 'ELU'],
    correct: 2,
    explanation: 'Sigmoid has derivatives bounded between 0 and 0.25, causing backpropagated gradients to vanish rapidly in deep networks.'
  }
];

export const demoCodingProblems = [
  {
    id: 'p1',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    acceptance: '53.4%',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    starterCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0, 1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1, 2]' }
    ]
  },
  {
    id: 'p2',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stacks',
    acceptance: '41.2%',
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    starterCode: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char in map) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
    testCases: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ]
  },
  {
    id: 'p3',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Sliding Window',
    acceptance: '35.8%',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    starterCode: `function lengthOfLongestSubstring(s) {
  let set = new Set();
  let left = 0;
  let max = 0;
  for (let right = 0; right < s.length; right++) {
    while (set.has(s[right])) {
      set.delete(s[left]);
      left++;
    }
    set.add(s[right]);
    max = Math.max(max, right - left + 1);
  }
  return max;
}`,
    testCases: [
      { input: 's = "abcabcbb"', output: '3' },
      { input: 's = "bbbbb"', output: '1' }
    ]
  }
];
