require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ── Middleware ─────────────────────────────────────────
app.use(cors());             // allow frontend to call API
app.use(express.json());    // parse JSON request bodies

// Serve uploaded CV files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/jobs',         require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/company',      require('./routes/company'));
app.use('/api/admin',        require('./routes/admin'));

// ── Health check ───────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'SJB API is running ✅', version: '1.0' });
});

// ── Start ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});