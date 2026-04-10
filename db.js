// db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); // أو استخدمي path لو عايزة تحفظ البيانات

db.serialize(() => {
  // ======= Users =======
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`);

  const users = [
    [1, 'Admin User', 'admin@email.com', 'password123', 'admin', '2026-03-30 13:41:48', '2026-03-30 13:41:48'],
    [2, 'Ayman Zahran', 'Ayman.Zahran@email', '12345678', 'student', '2026-03-30 13:41:49', '2026-03-30 13:41:49'],
    [3, 'Amr Nassar', 'Amr.Nassar@email', '12345678', 'student', '2026-03-30 13:41:50', '2026-03-30 13:41:50'],
    [4, 'Karim Sabry', 'Karim.Sabry@email', '12345678', 'student', '2026-03-30 13:41:50', '2026-03-30 13:41:50']
  ];

  const insertUser = db.prepare("INSERT INTO users (id, username, email, password, role, created_at, updated_at) VALUES (?,?,?,?,?,?,?)");
  users.forEach(u => insertUser.run(u));
  insertUser.finalize();

  // ======= Companies =======
  db.run(`CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`);

  const companies = [
    ['Horus Analytics','Horus.Analytics@email','12345678','company','2026-03-30 14:17:05','2026-03-30 14:17:05'],
    ['Delta Corp','Delta.Corp@email','12345678','company','2026-03-30 14:17:05','2026-03-30 14:17:05'],
    ['Cairo Business Solutions','Cairo.Business.Solutions@email','12345678','company','2026-03-30 14:17:05','2026-03-30 14:17:05']
  ];

  const insertCompany = db.prepare("INSERT INTO companies (name, email, password, role, created_at, updated_at) VALUES (?,?,?,?,?,?)");
  companies.forEach(c => insertCompany.run(c));
  insertCompany.finalize();

  // ======= Jobs =======
  db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    department TEXT,
    title TEXT NOT NULL,
    experience TEXT,
    salary TEXT,
    responsibilities TEXT,
    location TEXT
  );`);

  const jobs = [
    ['Vodafone Egypt','Telecom / IT','RF Optimization Engineer','No experience / Fresh Graduate','9,000–12,000 EGP','Drive tests, KPI monitoring','Smart Village, Cairo'],
    ['Urban Markets','Procurement','Purchasing Junior','No experience / Fresh graduate','6000–8000 EGP','Entry-level Procurement role','Maadi'],
    ['Urban Markets','Business Analysis','Junior Business Analyst','No experience / Fresh graduate','9000–13000 EGP','Entry-level Business Analysis role','New Cairo']
  ];

  const insertJob = db.prepare("INSERT INTO jobs (company_name, department, title, experience, salary, responsibilities, location) VALUES (?,?,?,?,?,?,?)");
  jobs.forEach(j => insertJob.run(j));
  insertJob.finalize();

  // ======= Job Applications =======
  db.run(`CREATE TABLE IF NOT EXISTS job_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    cv_file TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    applied_at TEXT NOT NULL,
    FOREIGN KEY(student_id) REFERENCES users(id),
    FOREIGN KEY(job_id) REFERENCES jobs(id)
  );`);

  const applications = [
    [2, 1, null, 'pending','2026-03-31 10:00:00'],
    [3, 2, null, 'accepted','2026-03-31 11:00:00'],
    [4, 3, null, 'rejected','2026-03-31 12:00:00']
  ];

  const insertApplication = db.prepare("INSERT INTO job_applications (student_id, job_id, cv_file, status, applied_at) VALUES (?,?,?,?,?)");
  applications.forEach(a => insertApplication.run(a));
  insertApplication.finalize();
});

module.exports = db;