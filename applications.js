const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth, requireCompany } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer config for CV uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// POST /api/applications
router.post('/', requireAuth, upload.single('cv'), (req, res) => {
  const { job_id } = req.body;
  const student_id = req.user.id;
  const cv_filename = req.file ? req.file.filename : null;

  if (!job_id) return res.status(400).json({ error: 'job_id is required' });

  db.get(
    'SELECT * FROM job_applications WHERE student_id=? AND job_id=?',
    [student_id, job_id],
    (err, existing) => {
      if (err) return res.status(500).json({ error: err.message });
      if (existing) return res.status(409).json({ error: 'Already applied to this job' });

      const today = new Date().toISOString().split('T')[0];
      db.run(
        `INSERT INTO job_applications (student_id, job_id, cv_file, status, applied_at)
         VALUES (?, ?, ?, 'applied', ?)`,
        [student_id, job_id, cv_filename, today],
        function(err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          res.status(201).json({ message: 'Application submitted', id: this.lastID });
        }
      );
    }
  );
});

// GET /api/applications/my
router.get('/my', requireAuth, (req, res) => {
  const sql = `
    SELECT ja.id as appId, ja.status, ja.applied_at, ja.cv_file,
           j.id as jobId, j.title, j.company_name as company, j.location, j.salary
    FROM job_applications ja
    JOIN jobs j ON j.id = ja.job_id
    WHERE ja.student_id = ?
    ORDER BY ja.applied_at DESC
  `;

  db.all(sql, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// PUT /api/applications/:id/status
router.put('/:id/status', requireCompany, (req, res) => {
  const { status } = req.body;
  if (!['applied', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run(
    `UPDATE job_applications SET status=? WHERE id=?`,
    [status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Status updated' });
    }
  );
});

module.exports = router;