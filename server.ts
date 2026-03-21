import express from 'express';
import { createServer as createViteServer } from 'vite';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import rateLimit from 'express-rate-limit';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-vip-key-2026';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per `window` (here, per hour)
  message: { error: 'Too many requests from this IP, please try again after an hour' },
  standardHeaders: true,
  legacyHeaders: false,
});

async function setupDatabase() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE,
      password TEXT,
      token_balance INTEGER DEFAULT 0,
      expire_date TEXT,
      status TEXT DEFAULT 'INACTIVE'
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      phone TEXT,
      reference TEXT UNIQUE,
      amount INTEGER,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  const db = await setupDatabase();

  // --- API ROUTES ---
  app.use('/api/', apiLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/admin/login', authLimiter);

  // Register
  app.post('/api/auth/register', async (req, res) => {
    const { phone, password } = req.body;
    try {
      const existing = await db.get('SELECT * FROM users WHERE phone = ?', [phone]);
      if (existing) {
        return res.status(400).json({ error: 'Phone number already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = `USER-${Math.floor(100000 + Math.random() * 900000)}-MG`;
      
      await db.run(
        'INSERT INTO users (id, phone, password, status) VALUES (?, ?, ?, ?)',
        [userId, phone, hashedPassword, 'INACTIVE']
      );

      const token = jwt.sign({ userId, phone }, JWT_SECRET, { expiresIn: '30d' });
      res.json({ token, user: { id: userId, phone, status: 'INACTIVE', expire_date: null } });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    const { phone, password } = req.body;
    try {
      const user = await db.get('SELECT * FROM users WHERE phone = ?', [phone]);
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Check expiration
      let status = user.status;
      if (user.expire_date && new Date(user.expire_date) < new Date()) {
        status = 'EXPIRED';
        await db.run('UPDATE users SET status = ? WHERE id = ?', [status, user.id]);
      }

      const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '30d' });
      res.json({ 
        token, 
        user: { id: user.id, phone: user.phone, status, expire_date: user.expire_date } 
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Get current user
  app.get('/api/auth/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await db.get('SELECT id, phone, status, expire_date FROM users WHERE id = ?', [decoded.userId]);
      
      if (!user) return res.status(404).json({ error: 'User not found' });

      // Check expiration
      let status = user.status;
      if (user.expire_date && new Date(user.expire_date) < new Date()) {
        status = 'EXPIRED';
        await db.run('UPDATE users SET status = ? WHERE id = ?', [status, user.id]);
      }

      res.json({ user: { ...user, status } });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Submit Payment
  app.post('/api/payments', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const { reference, amount } = req.body;

      await db.run(
        'INSERT INTO payments (user_id, phone, reference, amount, status) VALUES (?, ?, ?, ?, ?)',
        [decoded.userId, decoded.phone, reference, amount, 'pending']
      );

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Admin Login
  app.post('/api/admin/login', (req, res) => {
    const { code } = req.body;
    if (code === '@9729') {
      const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid admin code' });
    }
  });

  // Admin Middleware
  const adminAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (!decoded.admin) throw new Error();
      next();
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized admin' });
    }
  };

  // Admin: Get Users
  app.get('/api/admin/users', adminAuth, async (req, res) => {
    const users = await db.all('SELECT id, phone, status, expire_date, token_balance FROM users');
    res.json(users);
  });

  // Admin: Get Payments
  app.get('/api/admin/payments', adminAuth, async (req, res) => {
    const payments = await db.all('SELECT * FROM payments ORDER BY created_at DESC');
    res.json(payments);
  });

  // Admin: Validate Payment & Activate User
  app.post('/api/admin/validate-payment', adminAuth, async (req, res) => {
    const { paymentId, userId, days } = req.body;
    try {
      await db.run('UPDATE payments SET status = ? WHERE id = ?', ['validated', paymentId]);
      
      const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
      let expireDate = new Date();
      
      if (user && user.status === 'ACTIVE' && user.expire_date) {
        const currentExpire = new Date(user.expire_date);
        if (currentExpire > expireDate) {
          expireDate = currentExpire;
        }
      }
      
      expireDate.setDate(expireDate.getDate() + days);
      
      await db.run(
        'UPDATE users SET status = ?, expire_date = ?, token_balance = token_balance + ? WHERE id = ?',
        ['ACTIVE', expireDate.toISOString(), days, userId]
      );
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
