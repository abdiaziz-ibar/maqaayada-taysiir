# Taysiir International Schools KM13 — Restaurant & Meal Management System

A full canteen/restaurant management system for Taysiir International Schools (KM13, Mogadishu) — separate login, separate database, and separate codebase from the `school-fee-system` project next door.

## Stack

- **backend/** — Express + Prisma + PostgreSQL (JWT auth, bcrypt, RBAC), port `5050`
- **frontend/** — React 18 + Vite + Tailwind + Recharts + xlsx export, port `5174`
- **mobile/** — not built yet (deferred until the web app is confirmed solid, per plan)

## Roles

- **Administrator**: full access — students, parents, classes, meal plans, food/menu, holidays & fee adjustments, invoices, payments, users, audit logs, settings.
- **Restaurant Staff**: students/parents, daily attendance, occasional meals, food/menu. Financially-sensitive actions (meal plan pricing, fee adjustments, settings) require an admin to grant the `canManageFinance` flag from the Users page.

## Core features (mapped to the school's spec)

1. **Students** — full profile (class, section, gender, DOB, parent, optional meal plan).
2. **Parents** — full profile with financial summary and payment history; a parent's balance aggregates all their children's invoices.
3. **Meal Plans** — configurable meal types (breakfast/lunch/dinner) and monthly price per plan (e.g. KG = 2 meals/day, Grade = 1 meal/day); prices are never hard-coded.
4. **Invoices** — generated per month per enrolled student, support partial payments via `Payment` + `PaymentAllocation` (one payment can be split across several children/months).
5. **Holidays & Fee Adjustments** — a holiday period can override a month's invoice amount (full/half/custom/none), globally or per meal plan.
6. **Daily Attendance** — tracked per student, per day, **per meal type** (breakfast/lunch tracked separately), with big touch-friendly ATE/DID NOT EAT buttons and "Who Ate" / "Who Did Not Eat" filtered views.
7. **Occasional Meals** — an enrolled student not on a meal plan can still eat a one-off meal (searched by ID/name); never auto-converts them to a subscriber.
8. **Food & Menu** — foods are soft-deleted (`isActive`) so historical menus never lose data; daily/weekly menu with a "copy from previous day" action.
9. **Reports** — outstanding balances, monthly payment report, annual report (by academic year), student meal history — each with Excel export.
10. **Receipts** — print-friendly (`window.print()` → Save as PDF) per payment.
11. **Dashboard** — student/meal/financial summary cards + attendance and revenue charts.
12. **Audit Log** — every mutating admin/staff action is recorded (who, what, when).
13. **Global Search** — students, parents, classes from the top bar.
14. **Parent Portal** — separate phone+password login; parents see their children's invoices/balances and per-child meal history.

Explicitly **not built** yet (per the spec's own instruction to structure for later, not implement now): SMS/WhatsApp sending, QR/barcode scanning, kitchen inventory/supplier management, online payment gateway (Hormuud/Somtel).

## First-time setup

```bash
# Backend
cd backend
npm install
# create the Postgres database first: createdb taysiir_canteen (or edit .env)
npx prisma db push
npm run seed        # admin/Admin@123, default classes (KG–Grade 6), 2026-2027 academic year, sample meal plans
npm run dev          # http://localhost:5050

# Frontend (separate terminal)
cd frontend
npm install
npm run dev          # http://localhost:5174
```

Default admin login: **admin / Admin@123** — change it after first login.

## Notes

- Backend `.env` (`DATABASE_URL`, `JWT_SECRET`, `PORT=5050`, `CLIENT_ORIGIN`) and frontend `.env` (`VITE_API_URL`) are pre-filled for local development against a local Postgres instance.
- Ports were deliberately chosen (5050/5174) to not collide with `school-fee-system` (5000/5173) when both run at once locally.
- Excel exports use the `xlsx` package client-side; PDF export is via the browser's print dialog on print-styled pages (receipts, reports).

## Deployment (production — `maqaayda.idraakict.com`)

Nginx serves the built frontend as static files and reverse-proxies `/api/*` to the backend, which runs under PM2. GitHub Actions deploys automatically on every push to `main`.

**One-time server setup** (`/var/www/html/maqaayda-taysiir`, owned by the deploy user — not root):

```bash
sudo chown -R $USER:$USER /var/www/html/maqaayda-taysiir

# Backend .env — real production secrets, never committed
cd backend
cat > .env <<'EOF'
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/taysiir_canteen?schema=public
JWT_SECRET=<long random secret, different from local dev>
JWT_EXPIRES_IN=7d
PORT=5050
NODE_ENV=production
CLIENT_ORIGIN=https://maqaayda.idraakict.com
EOF

createdb taysiir_canteen   # if it doesn't already exist on this server's Postgres
npm ci
npx prisma migrate deploy
npm run seed                # first deploy only — creates admin/Admin@123 (change it after)

npm install -g pm2          # if not already installed
pm2 start ecosystem.config.js
pm2 save
pm2 startup                 # run the printed command once so PM2 survives a reboot

cd ../frontend
echo "VITE_API_URL=https://maqaayda.idraakict.com/api" > .env
npm ci
npm run build

# Nginx site
sudo cp ../deploy/nginx/maqaayda.idraakict.com.conf /etc/nginx/sites-available/maqaayda.idraakict.com
sudo ln -s /etc/nginx/sites-available/maqaayda.idraakict.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d maqaayda.idraakict.com
```

**GitHub Actions** (`.github/workflows/deploy.yml`): on every push to `main`, SSHes into the server, pulls, reinstalls deps, runs `prisma migrate deploy`, rebuilds the frontend, and restarts the PM2 process. Needs these repo secrets (Settings → Secrets and variables → Actions):

| Secret | Value |
|---|---|
| `DEPLOY_HOST` | the server's hostname/IP |
| `DEPLOY_USER` | the deploy user (e.g. `abdiaziz`) |
| `DEPLOY_SSH_KEY` | private half of a dedicated deploy keypair (its public half goes in that user's `~/.ssh/authorized_keys` on the server) |

After the first deploy, any future `git push` to `main` ships automatically — no manual server steps beyond the one-time setup above.
