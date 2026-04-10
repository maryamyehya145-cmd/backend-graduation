const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireCompany } = require('../middleware/auth');

// GET /api/company/jobs  — company's posted jobs
router.get('/jobs', requireCompany, (req, res) => {
  const companyName = req.user.name;
  db.all('SELECT * FROM job WHERE company = ?', [companyName], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /api/company/applicants/:jobId  — applicants for a specific job
router.get('/applicants/:jobId', requireCompany, (req, res) => {
  const sql = `
    SELECT u.id, u.username, u.email, ja.[id] as appId, ja.status, ja.applied_at
    FROM job_applications ja
    JOIN Users u ON u.id = ja.student_id
    WHERE ja.job_id = ?
  `;

  db.all(sql, [req.params.jobId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;