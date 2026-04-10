const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireCompany } = require('../middleware/auth');

// GET all jobs
router.get('/', (req, res) => {
  const { location, department } = req.query;
  let sql = 'SELECT * FROM jobs WHERE 1=1';
  const params = [];

  if (location) { sql += ' AND location LIKE ?'; params.push(`%${location}%`); }
  if (department) { sql += ' AND department LIKE ?'; params.push(`%${department}%`); }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET single job
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM jobs WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Job not found' });
    res.json(row);
  });
});

// POST new job (company only)
router.post('/', requireCompany, (req, res) => {
  const { title, department, experience, salary, responsibilities, location } = req.body;
  const company = req.user.name || req.user.email;

  const sql = `INSERT INTO jobs (company_name, department, title, experience, salary, responsibilities, location)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [company, department, title, experience, salary, responsibilities, location], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Job posted', id: this.lastID });
  });
});

module.exports = router;