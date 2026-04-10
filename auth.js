const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// ── POST /api/auth/register ─────────────────────────────
router.post('/register', (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const userRole = role || 'student';

  const sql = `INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, ?)`;

  db.run(sql, [username, email, hashedPassword, userRole], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: err.message });
    }

    const token = jwt.sign(
      { id: this.lastID, email, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registered successfully',
      token,
      user: { id: this.lastID, username, email, role: userRole }
    });
  });
});

// ── POST /api/auth/login ────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Check Users table (students & admin)
  db.get('SELECT * FROM Users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });

    if (user) {
      // Support both hashed (new) and plain (demo seed) passwords
      const isHash = user.password.startsWith('$2');
      const valid = isHash
        ? bcrypt.compareSync(password, user.password)
        : password === user.password;

      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      });
    }

    // If not in Users, check company table
    db.get(`SELECT * FROM company WHERE email = ?`, [email], (err2, comp) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (!comp) return res.status(401).json({ error: 'User not found' });

      const isHash = comp.password.startsWith('$2');
      const valid = isHash
        ? bcrypt.compareSync(password, comp.password)
        : password === comp.password;

      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { id: comp.email, email: comp.email, role: 'company', name: comp['company name'] },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: { email: comp.email, name: comp['company name'], role: 'company' }
      });
    });
  });
});

module.exports = router;