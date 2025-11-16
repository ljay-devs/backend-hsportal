# High School Portal – Backend and Frontend Guides

This repository contains the Node.js/Express backend for the High School Portal, plus complete frontend implementation guides for building a vanilla HTML/CSS/JS client.

## 📦 Backend

- Tech: Node.js, Express, MySQL (mysql2), JWT Auth
- Port: 6969
- Auth: Bearer JWT (30-minute expiry)
- Key Folders:
	- `controllers/` – role-based API controllers
	- `routes/` – Express route definitions
	- `database/` – MySQL connection and SQL schema
	- `middleware/` – auth middleware

Start the backend:

```bash
npm install
npm start
```

Base URL: `http://localhost:6969/api`

## 🎯 Frontend Implementation (Vanilla JS)

All frontend work is documented with complete, production-ready guides. No frameworks required.

### Guides Overview

1. FRONTEND_SETUP_GUIDE.md – Foundation (config, utils, api, auth, login, CSS)
2. FRONTEND_STUDENT_GUIDE.md – Student portal (dashboard, grades, achievements)
3. FRONTEND_TEACHER_GUIDE.md – Teacher portal (subjects, grading, re-attempts)
4. FRONTEND_ADVISER_GUIDE.md – Adviser portal (advisory, students, reports)
5. FRONTEND_ADMIN_GUIDE.md – Admin portal (full CRUD, periods, archive)
6. FRONTEND_IMPLEMENTATION_ROADMAP.md – Navigation and checklist
7. FRONTEND_GUIDES_SUMMARY.md – One-page summary for all guides

Start with the Setup Guide, then implement role portals in this recommended order:

1) Student → 2) Teacher → 3) Adviser → 4) Admin

## 🔗 Quick Links

- Setup: `FRONTEND_SETUP_GUIDE.md`
- Roadmap: `FRONTEND_IMPLEMENTATION_ROADMAP.md`
- Summary: `FRONTEND_GUIDES_SUMMARY.md`

## 🧪 Test Users (example)

Use your own seeded users or fixture data. Roles supported: Student, Teacher, Adviser, Admin.

## 🛠️ Notes

- CORS is enabled for local development
- Update connection credentials in `database/db.js` as needed
- SQL schema: `database/dbhighschoolportal.sql`

---

Happy building! 🚀