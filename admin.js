const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// GET /api/admin/stats  — dashboard overview numbers
router.get('/stats', requireAdmin, (req, res) => {
  const stats = {};

  db.get('SELECT COUNT(*) as count FROM Users WHERE role="student"', [], (e, r) => {
    stats.students = r?.count || 0;
    db.get('SELECT COUNT(*) as count FROM company', [], (e, r) => {
      stats.companies = r?.count || 0;
      db.get('SELECT COUNT(*) as count FROM job', [], (e, r) => {
        stats.jobs = r?.count || 0;
        db.get('SELECT COUNT(*) as count FROM job_applications', [], (e, r) => {
          stats.applications = r?.count || 0;
          res.json(stats);
        });
      });
    });
  });
});

// GET /api/admin/users  — all users list
router.get('/users', requireAdmin, (req, res) => {
  db.all('SELECT id, username, email, role, createdAt FROM Users ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// DELETE /api/admin/users/:id  — remove a user
router.delete('/users/:id', requireAdmin, (req, res) => {
  db.run('DELETE FROM Users WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted' });
  });
});

module.exports = router;