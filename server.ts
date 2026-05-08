import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import mammoth from 'mammoth';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// --- DATABASE MOCKUP / CONNECTOR ---
import pg from 'pg';
const { Pool } = pg;

// Simple in-memory fallback for local development without Postgres
let useMemoryDB = false;
const memoryDB: {
  users: any[];
  tests: any[];
  questions: any[];
  scores: any[];
} = {
  users: [],
  tests: [],
  questions: [],
  scores: []
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/math_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection and fallback
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

async function initDB() {
  if (useMemoryDB) return;
  
  const client = await pool.connect();
  try {
    console.log('Initializing database tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        grade_level VARCHAR(50),
        role VARCHAR(20) DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tests (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        grade_level VARCHAR(50) NOT NULL,
        duration_minutes INTEGER DEFAULT 45,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_answer CHAR(1) NOT NULL,
        order_index INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        test_id INTEGER REFERENCES tests(id),
        score DECIMAL(4,2),
        total_questions INTEGER,
        correct_answers INTEGER,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database tables initialized successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
    // If we can't init database, we might need to fallback to memory DB
    if (!useMemoryDB) {
       console.warn('Falling back to in-memory DB due to initialization failure.');
       useMemoryDB = true;
    }
  } finally {
    client.release();
  }
}

async function query(text: string, params?: any[]) {
  if (useMemoryDB) {
    return queryMemory(text, params);
  }
  try {
    return await pool.query(text, params);
  } catch (err: any) {
    if (err.code === 'ECONNREFUSED' || err.message.includes('ECONNREFUSED')) {
      console.warn('Postgres connection refused. Falling back to in-memory DB for this session.');
      useMemoryDB = true;
      return queryMemory(text, params);
    }
    throw err;
  }
}

// Very basic SQL mock for memory DB
function queryMemory(text: string, params?: any[]): any {
  const t = text.toLowerCase();
  if (t.includes('insert into users')) {
    const newUser = { id: memoryDB.users.length + 1, username: params![0], password: params![1], full_name: params![2], grade_level: params![3], role: params![4] };
    memoryDB.users.push(newUser);
    return { rows: [newUser] };
  }
  if (t.includes('select * from users where username = $1')) {
    const user = memoryDB.users.find(u => u.username === params![0]);
    return { rows: user ? [user] : [] };
  }
  if (t.includes('select * from tests where grade_level = $1')) {
    const tests = memoryDB.tests.filter(t => t.grade_level === params![0]);
    return { rows: tests };
  }
  if (t.includes('select id, question_text')) {
    const questions = memoryDB.questions.filter(q => q.test_id == params![0]);
    return { rows: questions };
  }
  if (t.includes('insert into tests')) {
    const newTest = { id: memoryDB.tests.length + 1, title: params![0], grade_level: params![1], duration_minutes: params![2], created_by: params![3] };
    memoryDB.tests.push(newTest);
    return { rows: [newTest] };
  }
  if (t.includes('insert into questions')) {
    const newQ = { id: memoryDB.questions.length + 1, test_id: params![0], question_text: params![1], option_a: params![2], option_b: params![3], option_c: params![4], option_d: params![5], correct_answer: params![6], order_index: params![7] };
    memoryDB.questions.push(newQ);
    return { rows: [newQ] };
  }
  if (t.includes('insert into scores')) {
    const newScore = { id: memoryDB.scores.length + 1, user_id: params![0], test_id: params![1], score: params![2], total_questions: params![3], correct_answers: params![4], completed_at: new Date() };
    memoryDB.scores.push(newScore);
    return { rows: [newScore] };
  }
  if (t.includes('select u.username')) {
    // Admin stats mock
    return { rows: memoryDB.scores.map(s => {
      const u = memoryDB.users.find(user => user.id === s.user_id);
      const test = memoryDB.tests.find(t => t.id === s.test_id);
      return {
        username: u?.username,
        full_name: u?.full_name,
        grade_level: u?.grade_level,
        test_title: test?.title,
        score: s.score,
        completed_at: s.completed_at
      };
    })};
  }
  return { rows: [] };
}

// --- UTILS ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || 'math-secret-key-123';
const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  await initDB();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Auth: Register
  app.post('/api/auth/register', async (req, res) => {
    const { username, password, fullName, gradeLevel, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await query(
        'INSERT INTO users (username, password, full_name, grade_level, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, role',
        [username, hashedPassword, fullName, gradeLevel, role || 'student']
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Username already exists or database error' });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const result = await query('SELECT * FROM users WHERE username = $1', [username]);
      if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user.id, username: user.username, role: user.role, fullName: user.full_name, gradeLevel: user.grade_level } });
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Middleware to verify JWT
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) return res.status(401).json({ error: 'Unauthorized' });
      req.user = decoded;
      next();
    });
  };

  // Tests: List by Grade
  app.get('/api/tests', authenticate, async (req: any, res) => {
    const { grade } = req.query;
    try {
      const result = await query('SELECT * FROM tests WHERE grade_level = $1 ORDER BY created_at DESC', [grade]);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Questions: Get for a test
  app.get('/api/tests/:id/questions', authenticate, async (req: any, res) => {
    const { id } = req.params;
    try {
      const result = await query('SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE test_id = $1 ORDER BY order_index', [id]);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Scores: Submit
  app.post('/api/scores', authenticate, async (req: any, res) => {
    const { testId, answers } = req.body; // answers: { questionId: 'A', ... }
    try {
      const questionsResult = await query('SELECT id, correct_answer FROM questions WHERE test_id = $1', [testId]);
      const actualQuestions = questionsResult.rows;

      let correctCount = 0;
      actualQuestions.forEach((q) => {
        if (answers[q.id] === q.correct_answer) {
          correctCount++;
        }
      });

      const score = (correctCount / actualQuestions.length) * 10;
      await query(
        'INSERT INTO scores (user_id, test_id, score, total_questions, correct_answers) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, testId, score, actualQuestions.length, correctCount]
      );

      res.json({ score, correctCount, total: actualQuestions.length });
    } catch (err) {
      res.status(500).json({ error: 'Error submitting score' });
    }
  });

  // Admin: Upload & Parse DOCX
  app.post('/api/admin/upload-test', authenticate, upload.single('file'), async (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { title, gradeLevel, durationMinutes } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    try {
      // 1. Mammoth extracts text (preserving basic structure)
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      const text = result.value;

      // 2. Parsing Logic (Regex)
      // Pattern: Câu [Số][:.] [Nội dung] A. [Đáp án] B. [Đáp án] C. [Đáp án] D. [Đáp án] (Đáp án đúng: X)
      const questionBlocks = text.split(/Câu\s+\d+[:.]/i).filter(b => b.trim().length > 0);
      const parsedQuestions = questionBlocks.map((block, index) => {
        const optionRegex = /([A-D])[\.\)]\s*([^A-D]+?)(?=[A-D][\.\)]|Đáp án đúng|$)/gi;
        const options: any = { A: '', B: '', C: '', D: '' };
        let match;
        while ((match = optionRegex.exec(block)) !== null) {
          options[match[1].toUpperCase()] = match[2].trim();
        }

        const correctAnswerMatch = /Đáp án đúng[:\s]+([A-D])/i.exec(block);
        const correctAnswer = (correctAnswerMatch ? correctAnswerMatch[1].toUpperCase() : 'A');

        // Question text is everything before the first option
        const firstOptionIndex = block.search(/[A-D][\.\)]/i);
        const questionText = firstOptionIndex !== -1 ? block.substring(0, firstOptionIndex).trim() : block.trim();

        return { questionText, options, correctAnswer, orderIndex: index };
      });

      // 3. Save to DB
      const testResult = await query(
        'INSERT INTO tests (title, grade_level, duration_minutes, created_by) VALUES ($1, $2, $3, $4) RETURNING id',
        [title, gradeLevel, durationMinutes, req.user.id]
      );
      const testId = testResult.rows[0].id;

      for (const q of parsedQuestions) {
        await query(
          'INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [testId, q.questionText, q.options.A, q.options.B, q.options.C, q.options.D, q.correctAnswer, q.orderIndex]
        );
      }

      res.json({ message: 'Test uploaded and parsed successfully', testId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error processing file' });
    }
  });

  // Admin Dashboard Stats
  app.get('/api/admin/stats', authenticate, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    try {
      const stats = await query(`
        SELECT u.username, u.full_name, u.grade_level, t.title as test_title, s.score, s.completed_at
        FROM scores s
        JOIN users u ON s.user_id = u.id
        JOIN tests t ON s.test_id = t.id
        ORDER BY s.completed_at DESC
      `);
      res.json(stats.rows);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'dist', 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
